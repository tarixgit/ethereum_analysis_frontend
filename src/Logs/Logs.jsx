import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
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
import Tooltip from '@material-ui/core/Tooltip'
import { FormattedNumber } from 'react-intl'
import Container from '@material-ui/core/Container'

const LOAD_LOGS = gql`
  query Logs($orderBy: Order, $offset: Int!, $limit: Int!) {
    logs(orderBy: [$orderBy], offset: $offset, limit: $limit) {
      rows {
        id
        description
        name
        createdAt
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
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description',
  },
  {
    id: 'createdAt',
    numeric: false,
    disablePadding: false,
    label: 'Created at',
    render: (val, _, column) => {
      const date = new Date(Number(val)) // maybe change
      return (
        <TableCell padding={column.disablePadding ? 'none' : 'default'}>
          {date ? date.toGMTString() : ''}
        </TableCell>
      )
    },
  },
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
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'visible', // scroll to visible for tests
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}))

const Logs = () => {
  const classes = useStyles()
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState(null)
  const [orderByQuery, setOrderQuery] = useState(null)
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { data, loading } = useQuery(LOAD_LOGS, {
    variables: {
      orderBy: orderByQuery,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
  })
  const rows = get(data, 'logs.rows', [])
  const count = get(data, 'logs.count', -1)

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
    setOrderQuery({ field: property, type: isAsc ? 'DESC' : 'ASC' })
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length)
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="xl" className={classes.container}>
        <Paper elevation={3} className={classes.root}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <div>
                <span>The logs from threads running on server</span>
              </div>
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
      </Container>
    </main>
  )
}

export default Logs
