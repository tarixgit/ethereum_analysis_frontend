import Paper from '@material-ui/core/Paper'
import React from 'react'
import { map } from 'lodash'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  table: {
    minWidth: 180,
  },
}))

const CustomTable = ({ columns, rows }) => {
  const classes = useStyles()
  const getCells = (row, columns) =>
    map(columns, col => (
      <TableCell component="th" scope="row">
        {String(row[col].value)}
      </TableCell>
    ))

  const rowsRendered = map(rows, row => (
    <TableRow key={row.id}>{getCells(row, columns)}</TableRow>
  ))

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            {map(columns, col => (
              <TableCell>{String(col)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{rowsRendered}</TableBody>
      </Table>
    </TableContainer>
  )
}

export default CustomTable
