import React, { useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TablePagination from '@material-ui/core/TablePagination'
import Paper from '@material-ui/core/Paper'
import { map, get, truncate } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import TableMenu from '../components/TableMenu'
import EnhancedTableHead from '../components/EnhancedTableHead'
import TableBodyEnhanced from '../components/TableBodyEnhanced'

const LOAD_IMPORT_ADDRESSES = gql`
  query ImportAddresses($orderBy: Order, $offset: Int!, $limit: Int!) {
    importAddresses(orderBy: [$orderBy], offset: $offset, limit: $limit) {
      rows {
        category
        hash
        coin
        id
        name
        reporter
        status
        subcategory
        url
        scam
      }
      count
    }
  }
`

const headCells = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'Ids',
  },
  {
    id: 'hash',
    numeric: false,
    disablePadding: false,
    label: 'Hash',
    render: (val, _, __, classes) => (
      <TableCell padding="none">
        <Link to={`graph/${val}`} className={classes.links}>
          <Button color="primary">
            {val.length > 42
              ? `${truncate(val, {
                  length: 42,
                })}`
              : val}
          </Button>
        </Link>
      </TableCell>
    ),
  },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'coin', numeric: false, disablePadding: false, label: 'Währung' },
  { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
  {
    id: 'subcategory',
    numeric: false,
    disablePadding: false,
    label: 'Subcategory',
  },
  { id: 'url', numeric: false, disablePadding: false, label: 'url' },
  {
    id: 'reporter',
    numeric: false,
    disablePadding: false,
    label: 'Quelle',
  },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'scam', numeric: false, disablePadding: false, label: 'Scam' },
]

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  paper: {
    // width: '100%',
    // marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  links: {
    color: 'inherit',
    textDecoration: 'none',
  },
}))

const ImportAddressTable = ({ importData }) => {
  const classes = useStyles()
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState(null)
  const [orderByQuery, setOrderQuery] = useState(null)
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { data, loading } = useQuery(LOAD_IMPORT_ADDRESSES, {
    variables: {
      orderBy: orderByQuery,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
  })
  const rows = get(data, 'importAddresses.rows', [])
  const count = get(data, 'importAddresses.count', -1)

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
    setOrderQuery({ field: property, type: isAsc ? 'DESC' : 'ASC' })
  }

  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelecteds = rows.map(n => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length)

  const openInfoModal = useCallback(() => {})
  return (
    <Paper elevation={3} className={classes.root}>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <div>
            <span>Blacklist and whitelist together</span>
          </div>
        </Grid>
        <Grid item>
          <TableMenu
            menuItems={[
              {
                label: 'Import blacklist data',
                handler: importData,
              },
              { label: 'Info', handler: openInfoModal },
            ]}
          />
        </Grid>
      </Grid>
      <Paper elevation={0} className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headCells={headCells}
            />
            <TableBodyEnhanced
              classes={classes}
              rows={rows}
              headCells={headCells}
              emptyRows={emptyRows}
            />
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </Paper>
  )
}

export default ImportAddressTable
