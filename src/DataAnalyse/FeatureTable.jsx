import React, { useCallback, useState } from 'react'
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
import { map, get, truncate, slice } from 'lodash'
import Button from '@material-ui/core/Button'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Link } from 'react-router-dom'
import download from 'downloadjs'
import { FormattedNumber, useIntl } from 'react-intl'

const LOAD_ADDRESS_FEATURES = gql`
  query AddressFeatures($offset: Int!, $limit: Int!) {
    addressFeatures(offset: $offset, limit: $limit) {
      rows {
        id
        hash
        scam
        numberOfNone
        numberOfOneTime
        numberOfExchange
        numberOfMiningPool
        numberOfMiner
        numberOfSmContract
        numberOfERC20
        numberOfERC721
        numberOfTrace
        numberOfTransaction
        medianOfEthProTrans
        averageOfEthProTrans
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
  { id: 'hash', numeric: false, disablePadding: true, label: 'hash' },
  {
    id: 'numberOfNone',
    numeric: false,
    disablePadding: false,
    label: 'n.None',
  },
  {
    id: 'numberOfOneTime',
    numeric: false,
    disablePadding: false,
    label: 'n.OneTime',
  },
  {
    id: 'numberOfExchange',
    numeric: false,
    disablePadding: false,
    label: 'n.Exch.',
  },
  {
    id: 'numberOfMiningPool',
    numeric: false,
    disablePadding: false,
    label: 'n.MiningP',
  },
  {
    id: 'numberOfMiner',
    numeric: false,
    disablePadding: false,
    label: 'n.Miner',
  },
  {
    id: 'numberOfSmContract',
    numeric: false,
    disablePadding: false,
    label: 'n.S.Contr',
  },
  {
    id: 'numberOfERC20',
    numeric: false,
    disablePadding: false,
    label: 'n.ERC20',
  },
  {
    id: 'numberOfERC721',
    numeric: false,
    disablePadding: false,
    label: 'n.ERC721',
  },
  {
    id: 'numberOfTrace',
    numeric: false,
    disablePadding: false,
    label: 'n.Trace',
  },
  {
    id: 'numberOfTransaction',
    numeric: false,
    disablePadding: false,
    label: 'n.Trans.',
  },
  {
    id: 'medianOfEthProTrans',
    numeric: false,
    disablePadding: false,
    label: 'medianOfEth',
  },
  {
    id: 'averageOfEthProTrans',
    numeric: false,
    disablePadding: false,
    label: 'Avg.OfEth',
  },
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
  button: {
    padding: 0,
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

const exportToCSV = (headCells, rows, formatNumber) => {
  const headers = map(headCells, 'id').join(';')
  const rowsString = map(rows, row =>
    map(headCells, ({ id }) => formatNumber(row[id])).join(';')
  ).join('\r\n')

  download(
    `data:text/csv;charset=utf-8,\ufeff${encodeURI(
      `${headers}\r\n${rowsString}`
    )}`,
    `addressFeature-${new Date().toISOString()}.csv`,
    'text/csv'
  )
}

const FeatureTable = ({ buildFeatures, buildRunning }) => {
  const classes = useStyles()
  const { formatNumber } = useIntl()
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('id') // sorting option
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const {
    data,
    refetch,
    loading: exportAddFeatureRunning,
    networkStatus,
  } = useQuery(LOAD_ADDRESS_FEATURES, {
    variables: { offset: page * rowsPerPage, limit: rowsPerPage },
  })
  let rows = get(data, 'addressFeatures.rows', [])
  rows = slice(rows, 0, rowsPerPage) // hack because of export/refetching
  const count = get(data, 'addressFeatures.count', -1)
  const exportAddFeatures = useCallback(async () => {
    const { data: dataToExport } = await refetch({ offset: 0, limit: 10000 })
    const rows = get(dataToExport, 'addressFeatures.rows', [])
    exportToCSV(headCells, rows, formatNumber)
  })
  const exportTransFeatures = useCallback(async () => {
    const { data } = await refetch({ offset: 0, limit: 10000 })
    const rows = get(data, 'addressFeatures.rows', [])
    exportToCSV(headCells, rows, formatNumber)
  })
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

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length)
  // TODO Menu stat 3 Buttons
  return (
    <Paper elevation={3} className={classes.root}>
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={buildRunning}
          onClick={buildFeatures}
        >
          Build features
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={exportAddFeatureRunning}
          onClick={exportAddFeatures}
        >
          Export address features
        </Button>
        <Button
          variant="contained"
          color="primary"
          // disbaled={exportTransFeatureRunning}
          onClick={exportTransFeatures}
        >
          Export trans. features
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
              {/* TODO refactor */}
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
                  <TableCell padding="none">
                    <Link to={`/${row.hash}`} className={classes.links}>
                      <Button
                        color="primary"
                        className={classes.button}
                        size="small"
                      >
                        {truncate(row.hash, {
                          length: 10,
                        })}
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell>{row.numberOfNone}</TableCell>
                  <TableCell>{row.numberOfOneTime}</TableCell>
                  <TableCell>{row.numberOfExchange}</TableCell>
                  <TableCell>{row.numberOfMiningPool}</TableCell>
                  <TableCell>{row.numberOfMiner}</TableCell>
                  <TableCell>{row.numberOfSmContract}</TableCell>
                  <TableCell>{row.numberOfERC20}</TableCell>
                  <TableCell>{row.numberOfERC721}</TableCell>
                  <TableCell>{row.numberOfTrace}</TableCell>
                  <TableCell>{row.numberOfTransaction}</TableCell>
                  <TableCell>
                    <FormattedNumber value={row.medianOfEthProTrans} />
                  </TableCell>
                  <TableCell>
                    <FormattedNumber value={row.averageOfEthProTrans} />
                  </TableCell>
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

export default FeatureTable
