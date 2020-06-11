import React, { useState, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TablePagination from '@material-ui/core/TablePagination'
import Paper from '@material-ui/core/Paper'
import { get } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import EnhancedTableHead from '../components/EnhancedTableHead'
import TableBodyEnhanced from '../components/TableBodyEnhanced'
import Container from '@material-ui/core/Container'
import { ScamNeighborContext } from '../App'

const LOAD_LOGS = gql`
  query Logs($orderBy: Order, $offset: Int!, $limit: Int!) {
    logs(orderBy: [$orderBy], offset: $offset, limit: $limit) {
      rows {
        id
        description
        name
        createdAt
        data {
          edges {
            from
            to
          }
          nodes {
            group
            id
            label
            shape
          }
        }
      }
      count
    }
  }
`

const headCells = setGraph => [
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
    render: (val, row, column) => {
      const date = new Date(Number(val)) // maybe change
      return (
        <TableCell
          padding={column.disablePadding ? 'none' : 'default'}
          key={`table_${row.id}_${column.id}`}
        >
          {date ? date.toGMTString() : ''}
        </TableCell>
      )
    },
  },
  {
    id: 'data',
    numeric: false,
    disablePadding: false,
    label: 'Data',
    render: (val, row, column, classes) => {
      const isData = get(val, 'nodes') && get(val, 'edges')
      return (
        <TableCell
          padding={column.disablePadding ? 'none' : 'default'}
          key={`table_${row.id}_${column.id}`}
        >
          {isData ? (
            <Link to="searchneighbors" className={classes.links}>
              <Button
                color="primary"
                className={classes.button}
                size="small"
                onClick={() => setGraph(val)}
              >
                show on graph
              </Button>
            </Link>
          ) : (
            ''
          )}
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
  button: {
    padding: 0,
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
  const { setNeighborsScamFounded } = useContext(ScamNeighborContext)
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState('createdAt')
  const [orderByQuery, setOrderQuery] = useState({
    field: 'createdAt',
    type: 'DESC',
  })
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { data, loading } = useQuery(LOAD_LOGS, {
    variables: {
      orderBy: orderByQuery,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
    fetchPolicy: 'cache-and-network',
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
                  headCells={headCells(setNeighborsScamFounded)}
                />
                <TableBodyEnhanced
                  classes={classes}
                  rows={rows}
                  headCells={headCells(setNeighborsScamFounded)}
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
