import React, {
  useState,
  useCallback,
  Fragment,
  useEffect,
  useContext,
} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TablePagination from '@material-ui/core/TablePagination'
import Paper from '@material-ui/core/Paper'
import { map, get, truncate } from 'lodash'
import Button from '@material-ui/core/Button'
import { useLazyQuery, useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import TableMenu from '../components/TableMenu'
import EnhancedTableHead from '../components/EnhancedTableHead'
import TableBodyEnhanced from '../components/TableBodyEnhanced'
import ModalDialog from '../components/ModalDialog'
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { SnackbarContext } from '../App'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import { withStyles } from '@material-ui/core'

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

const ADDRESS = gql`
  query Addresses($address: String!) {
    addresses(address: $address) {
      id
      scam
      hash
      alias
      labelId
      label {
        id
        name
      }
    }
  }
`
const ADD_ADDRESS = gql`
  mutation AddAddressToImport($address: ImportAddressInput!) {
    addAddressToImport(address: $address) {
      success
      message
    }
  }
`
const DELETE_ADDRESS = gql`
  mutation DeleteAddressToImport($id: Int!) {
    deleteAddressToImport(id: $id) {
      success
      message
    }
  }
`

const LinkButton = withStyles({
  root: {
    boxShadow: 'none',
    textTransform: 'none',
  },
})(Button)
const getHeadCells = deleteImportAddressCallback => [
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
    render: (val, row, column, classes) => (
      <TableCell padding="none" key={`table_${row.id}_${column.id}`}>
        <Link to={`graph/${val}`} className={classes.links}>
          <LinkButton color="primary">
            {val.length > 42
              ? `${truncate(val, {
                  length: 42,
                })}`
              : val}
          </LinkButton>
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
  {
    id: 'remove',
    numeric: false,
    disablePadding: true,
    noFilter: false,
    label: '',
    render: (val, row, column, classes) => (
      <TableCell padding="none" key={`table_${row.id}_${column.id}`}>
        <IconButton
          aria-label="expand row"
          size="small"
          onClick={() => deleteImportAddressCallback(Number(row.id))}
        >
          <ClearIcon />
        </IconButton>
      </TableCell>
    ),
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
  links: {
    color: 'inherit',
    textDecoration: 'none',
  },
  tableContainer: {
    maxHeight: 440,
    overflowX: 'auto',
    overflowY: 'auto',
  },
}))

const ImportAddressTable = ({ importData, openInfo }) => {
  const classes = useStyles()
  const { setSnackbarMessage } = useContext(SnackbarContext)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('id')
  const [isAddAddressOpen, setAddAddressOpen] = useState(false)
  const [addressHash, setAddressHash] = useState('')
  const [newImportAddress, setNewImportAddress] = useState({
    hash: '',
    name: '',
    category: '',
    reporter: '',
    scam: false,
  })
  const [orderByQuery, setOrderQuery] = useState({
    field: 'id',
    type: 'ASC',
  })
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { data, refetch } = useQuery(LOAD_IMPORT_ADDRESSES, {
    variables: {
      orderBy: orderByQuery,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
  })
  const [
    loadAddressData,
    {
      data: addressData,
      loading: addressLoading,
      networkStatus: networkStatusAddress,
    },
  ] = useLazyQuery(ADDRESS)
  const [addNewImportAddress] = useMutation(ADD_ADDRESS, {
    onCompleted: data => {
      const importDataResponse = get(data, 'addAddressToImport', {
        success: null,
        message: null,
      })
      if (importDataResponse.success) {
        setNewImportAddress({
          hash: '',
          name: '',
          category: '',
          reporter: '',
          scam: false,
        })
        setSnackbarMessage({
          type: 'success',
          message: importDataResponse.message
            ? importDataResponse.message
            : 'new address added',
        })
        refetch()
        return
      }
      setSnackbarMessage({ type: 'error', message: 'Error occur' })
    },
  })
  const [deleteImportAddress] = useMutation(DELETE_ADDRESS, {
    onCompleted: data => {
      const importDataResponse = get(data, 'deleteAddressToImport', {
        success: null,
        message: null,
      })
      refetch()
      if (importDataResponse.success) {
        setSnackbarMessage({
          type: 'success',
          message: importDataResponse.message
            ? importDataResponse.message
            : 'address deleted',
        })
        return
      }
      setSnackbarMessage({ type: 'error', message: 'Error occur' })
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

  const openInfoModal = useCallback(() => {
    openInfo({
      title: 'Black and white adresses',
      infoText:
        'Here you see the addresses that was used for calculation of features. The pool consist of black(scam) and white(not scam) addresses. If you want to import the new black addresses from https://etherscamdb.info please select menu "Import blacklist data" ',
    })
  })
  useEffect(() => {
    const address = get(addressData, 'addresses[0]', null)
    if (address && !addressLoading) {
      // prepare NewImportAddress
      const {
        scam,
        hash,
        alias,
        label: { name },
      } = address
      setNewImportAddress({
        hash,
        name: alias,
        category: name,
        reporter: 'manual',
        scam,
      })
    }
  }, [networkStatusAddress, addressLoading, loadAddressData])
  const changeAddress = useCallback(
    e => {
      const { value } = e.target
      if (value.length >= 42) {
        loadAddressData({
          variables: { address: value.toLowerCase() },
        })
      }
      setNewImportAddress({ ...newImportAddress, hash: value })
      //setAddressHash(value)
    },
    [loadAddressData, setAddressHash]
  )
  const changeNewImportAddress = useCallback((e, field) => {
    const { value, checked } = e.target
    newImportAddress[field] = field === 'scam' ? checked : value
    setNewImportAddress({ ...newImportAddress })
  })
  const onSubmitNewAddress = useCallback(() => {
    if (newImportAddress.hash) {
      addNewImportAddress({ variables: { address: newImportAddress } })
    } else {
      setSnackbarMessage({
        type: 'warning',
        message: 'The field hash is empty.',
      })
    }
  })
  const deleteImportAddressCallback = useCallback(id => {
    deleteImportAddress({ variables: { id } })
  })
  const headCells = getHeadCells(deleteImportAddressCallback)
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
              {
                label: 'Add address to list',
                handler: () => setAddAddressOpen(true),
              },
              { label: 'Info', handler: openInfoModal },
            ]}
          />
        </Grid>
      </Grid>
      <Paper elevation={0} className={classes.paper}>
        <TableContainer className={classes.tableContainer}>
          <Table
            stickyHeader
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
      {isAddAddressOpen && (
        <ModalDialog
          applyHandler={onSubmitNewAddress}
          applyText="Add"
          closeHandler={() => setAddAddressOpen(false)}
          closeText="Close"
          title={'Add new address to the list'}
          infoText={
            <Fragment>
              <TextField
                id="address-input"
                label="Address"
                style={{ marginLeft: 1, paddingRight: 1 }}
                autoFocus
                fullWidth
                value={newImportAddress.hash}
                onChange={changeAddress}
              />
              <TextField
                id="address-input"
                label="Name"
                style={{ marginLeft: 1, paddingRight: 1 }}
                autoFocus
                value={newImportAddress.name}
                onChange={e => changeNewImportAddress(e, 'name')}
              />
              <TextField
                id="address-input"
                label="Category"
                style={{ marginLeft: 1, paddingRight: 1 }}
                autoFocus
                value={newImportAddress.category}
                onChange={e => changeNewImportAddress(e, 'category')}
              />
              <TextField
                id="address-input"
                label="Reporter"
                style={{ marginLeft: 1, paddingRight: 1 }}
                autoFocus
                value={newImportAddress.reporter}
                onChange={e => changeNewImportAddress(e, 'reporter')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newImportAddress.scam}
                    onChange={e => changeNewImportAddress(e, 'scam')}
                    name="scam"
                    color="primary"
                  />
                }
                label="Scam"
              />
            </Fragment>
          }
        />
      )}
    </Paper>
  )
}

export default ImportAddressTable
