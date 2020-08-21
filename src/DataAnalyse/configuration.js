import TableCell from '@material-ui/core/TableCell'
import Tooltip from '@material-ui/core/Tooltip'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { truncate } from 'lodash'
import React from 'react'

export const headCells = [
  {
    id: 'id',
    numeric: true,
    disablePadding: true,
    label: 'Ids',
  },
  {
    id: 'hash',
    numeric: false,
    disablePadding: true,
    label: 'hash',
    render: (val, row, column, classes) => (
      <TableCell padding="none" key={`table_${row.id}_${column.id}`}>
        <Tooltip title={val} aria-label="add">
          <Link to={`graph/${val}`} className={classes.links}>
            <Button color="primary" className={classes.button} size="small">
              {truncate(val, {
                length: 10,
              })}
            </Button>
          </Link>
        </Tooltip>
      </TableCell>
    ),
  },
  { id: 'scam', numeric: false, disablePadding: false, label: 'Scam' },
  {
    id: 'numberOfNone',
    numeric: true,
    disablePadding: true,
    label: 'n.None',
  },
  {
    id: 'numberOfNoneInput',
    numeric: true,
    disablePadding: true,
    label: 'n.OfNoneInput',
  },
  {
    id: 'numberOfOneTime',
    numeric: true,
    disablePadding: true,
    label: 'n.OneTime',
  },
  {
    id: 'numberOfOneTimeInput',
    numeric: true,
    disablePadding: true,
    label: 'n.OfOneTimeInput',
  },
  {
    id: 'numberOfExchange',
    numeric: true,
    disablePadding: false,
    label: 'n.Exch.',
  },
  {
    id: 'numberOfExchangeInput',
    numeric: true,
    disablePadding: true,
    label: 'n.OfExchangeInput',
  },
  {
    id: 'numberOfMiningPool',
    numeric: true,
    disablePadding: false,
    label: 'n.MiningP',
  },
  {
    id: 'numberOfMiningPoolInput',
    numeric: true,
    disablePadding: true,
    label: 'n.OfMiningPoolInput',
  },
  {
    id: 'numberOfMiner',
    numeric: true,
    disablePadding: false,
    label: 'n.Miner',
  },
  {
    id: 'numberOfMinerInput',
    numeric: true,
    disablePadding: true,
    label: 'n.OfMinerInput',
  },
  {
    id: 'numberOfSmContract',
    numeric: true,
    disablePadding: false,
    label: 'n.S.Contr',
  },
  {
    id: 'numberOfSmContractInput',
    numeric: true,
    disablePadding: false,
    label: 'n.S.ContrInput',
  },
  {
    id: 'numberOfERC20',
    numeric: true,
    disablePadding: false,
    label: 'n.ERC20',
  },
  {
    id: 'numberOfERC20Input',
    numeric: true,
    disablePadding: true,
    label: 'n.OfERC20Input',
  },
  {
    id: 'numberOfERC721',
    numeric: true,
    disablePadding: false,
    label: 'n.ERC721',
  },
  {
    id: 'numberOfERC721Input',
    numeric: true,
    disablePadding: true,
    label: 'n.OfERC721Input',
  },
  // {
  //   id: 'numberOfTrace',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'n.Trace',
  // },
  {
    id: 'numberOfTransactions',
    numeric: true,
    disablePadding: false,
    label: 'n.Trans.',
  },
  {
    id: 'numberOfTransInput',
    numeric: true,
    disablePadding: false,
    label: 'n.Trans.In',
  },
  {
    id: 'numberOfTransOutput',
    numeric: true,
    disablePadding: false,
    label: 'n.Trans.Out',
  },
  {
    id: 'medianOfEthProTrans',
    numeric: true,
    disablePadding: true,
    label: 'medianOfEth',
  },
  {
    id: 'transInputMedian',
    numeric: true,
    disablePadding: true,
    label: 'transInputMedian',
  },
  {
    id: 'transOutputMedian',
    numeric: true,
    disablePadding: true,
    label: 'transOutputMedian',
  },
  {
    id: 'averageOfEthProTrans',
    numeric: true,
    disablePadding: true,
    label: 'Avg.OfEth',
  },
  {
    id: 'transInputAverage',
    numeric: true,
    disablePadding: true,
    label: 'Avg.OfEth.Input',
  },
  {
    id: 'transOutputAverage',
    numeric: true,
    disablePadding: true,
    label: 'Avg.OfEth.Output',
  },
  {
    id: 'minEth',
    numeric: true,
    disablePadding: true,
    label: 'minEth',
  },
  {
    id: 'maxEth',
    numeric: true,
    disablePadding: true,
    label: 'maxEth',
  },
  {
    id: 'transInputMinEth',
    numeric: true,
    disablePadding: true,
    label: 'transInputMinEth',
  },
  {
    id: 'transInputMaxEth',
    numeric: true,
    disablePadding: true,
    label: 'transInputMaxEth',
  },
  {
    id: 'transOutputMinEth',
    numeric: true,
    disablePadding: true,
    label: 'transOutputMinEth',
  },
  {
    id: 'transOutputMaxEth',
    numeric: true,
    disablePadding: true,
    label: 'transOutputMaxEth',
  },
  {
    id: 'transInputMedianEth',
    numeric: true,
    disablePadding: true,
    label: 'transInputMedianEth',
  },
  {
    id: 'transInputAverageEth',
    numeric: true,
    disablePadding: true,
    label: 'transInputAverageEth',
  },
  {
    id: 'transOutputMedianMinEth',
    numeric: true,
    disablePadding: true,
    label: 'transOutputMedianMinEth',
  },
  {
    id: 'transOutputAverageEth',
    numeric: true,
    disablePadding: true,
    label: 'transOutputAverageEth',
  },
  {
    id: 'numberOfScamNeighbor',
    numeric: true,
    disablePadding: true,
    label: 'numberOfScamNeighbor',
  },
  {
    id: 'numberOfScamNeighborInput',
    numeric: true,
    disablePadding: true,
    label: 'numberOfScamNeighborInput',
  },
  {
    id: 'numberOfNoneTr',
    numeric: true,
    disablePadding: true,
    label: 'noneTr',
  },
  {
    id: 'numberOfOneTimeTr',
    numeric: true,
    disablePadding: true,
    label: 'oneTimeTr',
  },
  {
    id: 'numberOfExchangeTr',
    numeric: true,
    disablePadding: true,
    label: 'exchangeTr',
  },
  {
    id: 'numberOfMinerTr',
    numeric: true,
    disablePadding: true,
    label: 'minerTr',
  },
  {
    id: 'numberOfSmContractTr',
    numeric: true,
    disablePadding: true,
    label: 'SmContractTr',
  },
  {
    id: 'numberOfERC20Tr',
    numeric: true,
    disablePadding: true,
    label: 'ERC20Tr',
  },
  {
    id: 'numberOfERC721Tr',
    numeric: true,
    disablePadding: true,
    label: 'ERC721Tr',
  },
]
