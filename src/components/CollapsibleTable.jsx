import Paper from '@material-ui/core/Paper'
import React, { Fragment } from 'react'
import { map } from 'lodash'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'

import Grid from '@material-ui/core/Grid'
import { Form, Field } from 'react-final-form'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'

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

const Row = ({
  row,
  columns,
  onSubmitRf,
  onSubmitLg,
  onSubmitKNN,
  rfSettings,
  lgSettings,
}) => {
  const [open, setOpen] = React.useState(false)
  //const classes = useRowStyles();
  const getCells = (row, columns) =>
    map(columns, col => (
      <TableCell
        component="th"
        scope="row"
        key={`cell_${row.id}_${col.id}`}
        align={col.id === 'accuracy' ? 'center' : 'left'}
        size="small"
      >
        {String(row[col.id].value ? row[col.id].value : 0)}
      </TableCell>
    ))
  return (
    <Fragment>
      <TableRow key={row.id}>
        <TableCell component="th">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {getCells(row, columns)}
      </TableRow>
      <TableRow key={`sub_col_${row.id}`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Settings
              </Typography>
              {row.id === 'idPrecision_rf' && (
                <Form
                  onSubmit={onSubmitRf}
                  initialValues={rfSettings}
                  render={({ handleSubmit, submitting, pristine }) => (
                    <form onSubmit={handleSubmit}>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                      >
                        <Grid item xs={2}>
                          <label>Seed</label>
                          <Field name="seed" parse={Number}>
                            {({ input: { value, onChange, name } }) => (
                              <div>
                                <TextField
                                  name={name}
                                  value={value}
                                  onChange={onChange}
                                />
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <label>maxFeatures</label>
                          <Field name="maxFeatures" parse={Number}>
                            {({ input: { value, onChange, name } }) => (
                              <div>
                                <TextField
                                  name={name}
                                  value={value}
                                  onChange={onChange}
                                />
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <label>replacement</label>
                          <Field name="replacement">
                            {({ input: { value, onChange, name } }) => (
                              <Checkbox
                                color="primary"
                                inputProps={{
                                  'aria-label': 'secondary checkbox',
                                }}
                                name={name}
                                checked={value}
                                onChange={onChange}
                              />
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <label>nEstimators</label>
                          <Field name="nEstimators" parse={Number}>
                            {({ input: { value, onChange, name } }) => (
                              <div>
                                <TextField
                                  name={name}
                                  value={value}
                                  onChange={onChange}
                                />
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            type="submit"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={submitting || pristine}
                          >
                            <CheckCircleOutlineIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                />
              )}
              {row.id === 'idPrecision_lg' && (
                <Form
                  onSubmit={onSubmitLg}
                  initialValues={lgSettings}
                  render={({ handleSubmit, submitting, pristine }) => (
                    <form onSubmit={handleSubmit}>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                      >
                        <Grid item xs={2}>
                          <label>Number of steps</label>
                          <Field name="numSteps" parse={Number}>
                            {props => (
                              <div>
                                <TextField
                                  name={props.input.name}
                                  value={props.input.value}
                                  onChange={props.input.onChange}
                                />
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <label>Learning rate</label>
                          <Field name="learningRate" parse={Number}>
                            {props => (
                              <div>
                                <TextField
                                  name={props.input.name}
                                  value={props.input.value}
                                  onChange={props.input.onChange}
                                />
                              </div>
                            )}
                          </Field>
                        </Grid>
                        <Grid item xs={2}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            type="submit"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={submitting || pristine}
                          >
                            <CheckCircleOutlineIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                />
              )}
              {row.id === 'idPrecision_KNN' && (
                <Form
                  onSubmit={onSubmitRf}
                  initialValues={{
                    seed: 3,
                    maxFeatures: 0.8,
                    replacement: true,
                    nEstimators: 25,
                  }}
                  render={({ handleSubmit, submitting, pristine }) => (
                    <form onSubmit={handleSubmit}>
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                      >
                        <Grid item xs={2}>
                          No settings for KNN classifier
                        </Grid>
                      </Grid>
                    </form>
                  )}
                />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}
// seed: 3, // for random function(MersenneTwister) for bagging
//   maxFeatures: 0.8, // part of features used for bagging replacement:
//   true, // for bagging nEstimators: 25,

const CollapsibleTable = ({
  columns,
  rows,
  onSubmitRf,
  onSubmitLg,
  onSubmitKNN,
  rfSettings,
  lgSettings,
}) => {
  const classes = useStyles()
  const rowsRendered = map(rows, row => (
    <Row
      key={`colapse_row_${row.id}`}
      row={row}
      columns={columns}
      onSubmitRf={onSubmitRf}
      onSubmitLg={onSubmitLg}
      onSubmitKNN={onSubmitKNN}
      rfSettings={rfSettings}
      lgSettings={lgSettings}
    />
  ))

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell key="head_empty" />
            {map(columns, col =>
              col.id === 'accuracy' ? (
                <TableCell key={`head_${col}`} align="center" size="small">
                  Accuracy <br /> [0;1]
                </TableCell>
              ) : (
                <TableCell key={`head_${col}`}>{String(col.name)}</TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>{rowsRendered}</TableBody>
      </Table>
    </TableContainer>
  )
}

export default CollapsibleTable
