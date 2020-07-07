import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { ceil } from 'lodash'

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
})

const PrecisionTable = ({ precisionData }) => {
  const classes = useStyles()
  const {
    truePositive,
    trueNegative,
    falsePositive,
    falseNegative,
  } = precisionData
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">Condition positive</TableCell>
            <TableCell align="right">Condition negative</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key="PredictedConditionPos">
            <TableCell component="th" scope="row">
              Predicted condition positive
            </TableCell>
            <TableCell align="right">{truePositive}</TableCell>
            <TableCell align="right">{falsePositive}</TableCell>
          </TableRow>
          <TableRow key="PredictedConditionNeg">
            <TableCell component="th" scope="row">
              Predicted condition negative
            </TableCell>
            <TableCell align="right">{falseNegative}</TableCell>
            <TableCell align="right">{trueNegative}</TableCell>
          </TableRow>
          <TableRow key="PredictedConditionPos">
            <TableCell component="th" scope="row">
              [True, False] rate
            </TableCell>
            <TableCell align="right">
              True positive rate:
              {ceil((truePositive / (truePositive + falseNegative)) * 100, 2)}%
            </TableCell>
            <TableCell align="right">
              False positive rate:
              {ceil((falsePositive / (falsePositive + trueNegative)) * 100, 2)}%
            </TableCell>
          </TableRow>
          <TableRow key="PredictedConditionNeg">
            <TableCell component="th" scope="row">
              [False, True] rate
            </TableCell>
            <TableCell align="right">
              False negative rate:
              {ceil((falseNegative / (truePositive + falseNegative)) * 100, 2)}%
            </TableCell>
            <TableCell align="right">
              True negative rate:
              {ceil((trueNegative / (falsePositive + trueNegative)) * 100, 2)}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PrecisionTable
