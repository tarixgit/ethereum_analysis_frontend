import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import React from 'react'
import PropTypes from 'prop-types'
import { map } from 'lodash'
import TableBody from '@material-ui/core/TableBody'
import { FormattedNumber } from 'react-intl'

const TableBodyEnhanced = ({ classes, rows, headCells, emptyRows }) => {
  const getCells = (row, headCells) =>
    map(headCells, column => {
      const { id, render, numeric = false, disablePadding = true } = column
      if (typeof render === 'function') {
        return render(row[id], row, column, classes)
      }
      if (id === 'id') {
        return (
          <TableCell
            component="th"
            scope="row"
            padding={disablePadding ? 'none' : 'default'}
          >
            {row.id}
          </TableCell>
        )
      }
      if (numeric) {
        return (
          <TableCell padding={disablePadding ? 'none' : 'default'}>
            <FormattedNumber value={row[id]} />
          </TableCell>
        )
      }
      return (
        <TableCell padding={disablePadding ? 'none' : 'default'}>
          {String(row[id])}
        </TableCell>
      )
    })
  //FormattedNumber
  const rowsRendered = map(rows, row => (
    <TableRow hover tabIndex={-1} key={row.id}>
      {getCells(row, headCells)}
    </TableRow>
  ))

  return (
    <TableBody>
      {rowsRendered}
      {emptyRows > 0 && (
        <TableRow style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      )}
    </TableBody>
  )
}

TableBodyEnhanced.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
}
export default TableBodyEnhanced
