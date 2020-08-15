import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { map } from 'lodash'
import TableBody from '@material-ui/core/TableBody'
import { FormattedNumber } from 'react-intl'

const TableBodyEnhanced = ({ classes, rows, headCells, emptyRows }) => {
  const [selectedId, setSelectedId] = useState(null)
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
            key={`table_${row.id}_${id}`}
          >
            {row.id}
          </TableCell>
        )
      }
      if (numeric) {
        return (
          <TableCell
            padding={disablePadding ? 'none' : 'default'}
            key={`table_${row.id}_${id}`}
          >
            <FormattedNumber value={row[id]} />
          </TableCell>
        )
      }
      return (
        <TableCell
          padding={disablePadding ? 'none' : 'default'}
          key={`table_${row.id}_${id}`}
        >
          {String(row[id])}
        </TableCell>
      )
    })
  //FormattedNumber
  const rowsRendered = map(rows, row => (
    <TableRow
      hover
      tabIndex={-1}
      key={row.id}
      selected={selectedId === row.id}
      onClick={() => setSelectedId(row.id)}
    >
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
  rows: PropTypes.array.isRequired,
  headCells: PropTypes.array.isRequired,
  emptyRows: PropTypes.number.isRequired,
}
export default TableBodyEnhanced
