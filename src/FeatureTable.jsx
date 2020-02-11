import React from 'react'
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
import { map, get } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const LOAD_IMPORT_ADDRESSES = gql`
  query MyQuery {
    importAddresses {
      category
      hash
      coin
      id
      name
      reporter
      status
      subcategory
      url
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
  { id: 'f0', numeric: false, disablePadding: false, label: 'Feature 0' },
  {
    id: 'f1',
    numeric: false,
    disablePadding: false,
    label: 'Feature 1',
  },
  { id: 'f2', numeric: false, disablePadding: false, label: 'Feature 2' },
  {
    id: 'f3',
    numeric: false,
    disablePadding: false,
    label: 'Feature 3',
  },
  { id: 'f4', numeric: false, disablePadding: false, label: 'Feature 4' },
  {
    id: 'f5',
    numeric: false,
    disablePadding: false,
    label: 'Feature 5',
  },
  { id: 'f6', numeric: false, disablePadding: false, label: 'Feature 6' },
]

const EnhancedTableHead = props => {
  const { classes, order, orderBy, onRequestSort } = props
  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}

const useStyles = makeStyles(theme => ({
  root: {
    // width: '100%',
    paddingTop: '19px',
    paddingLeft: '19px',
    paddingRight: '19px',
    margin: '10px',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
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
}))

const FeatureTable = ({ loadData }) => {
  const classes = useStyles()
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('calories')
  const [selected, setSelected] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  // const { data, loading } = useQuery(LOAD_IMPORT_ADDRESSES)
  // const rows = get(data, 'importAddresses', [])
  const rows = [
    { id: 1, f0: 20, f1: 10, f2: 5, f3: 1, f4: 3, f5: 1, f6: 9 },
    { id: 2, f0: 11, f1: 50, f2: 5, f3: 1, f4: 3, f5: 1, f6: 9 },
    { id: 3, f0: 22, f1: 26, f2: 5, f3: 1, f4: 3, f5: 1, f6: 9 },
  ]

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
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

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

  return (
    <Paper elevation={3} className={classes.root}>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button variant="contained" color="primary" onClick={loadData}>
          Import new data
        </Button>
      </div>
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
            />
            <TableBody>
              {map(rows, row => (
                <TableRow
                  hover
                  onClick={event => handleClick(event, row.id)}
                  role="checkbox"
                  tabIndex={-1}
                  key={row.id}
                >
                  <TableCell component="th" scope="row" padding="none">
                    {row.id}
                  </TableCell>
                  <TableCell align="right">{row.f1}</TableCell>
                  <TableCell>{row.f2}</TableCell>
                  <TableCell>{row.f3}</TableCell>
                  <TableCell>{row.f4}</TableCell>
                  <TableCell>{row.f5}</TableCell>
                  <TableCell>{row.f6}</TableCell>
                  <TableCell>{row.f0}</TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </Paper>
  )
}

export default FeatureTable
