import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as vis from 'vis-network'
import { makeStyles } from '@material-ui/core/styles'
import { networkOptions } from './config'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
}))

const nodesSet = new vis.DataSet([])
const edgesSet = new vis.DataSet([])

function useBuildNetworkHook(nodes, edges, loadMore) {
  const ref = useRef(null)
  const [networkForAnswer, setNetworkForAnswer] = useState()
  let network = null

  const onContextBounded = useCallback(
    props => {
      const { event, nodes, edges, pointer } = props

      const nodeId = network.getNodeAt(pointer.DOM)
      if (nodeId) {
        network.selectNodes([nodeId])
        loadMore(nodeId)
      }
      event.preventDefault()
    },
    [network, nodes, edges, loadMore]
  )

  const setRef = useCallback(node => {
    if (ref.current) {
      network.off('oncontext', onContextBounded)
    }
    if (node) {
      network = new vis.Network(node, { nodes, edges }, networkOptions)
      network.on('oncontext', onContextBounded)
      setNetworkForAnswer(network)
    }
    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef, ref, networkForAnswer]
}

const Network = ({ nodes, edges, loadMore, labels }) => {
  const classes = useStyles()
  const [ref, refObject, network] = useBuildNetworkHook(
    nodesSet,
    edgesSet,
    loadMore
  )
  useEffect(() => {
    const fitOption = {
      nodes: nodesSet.getIds(),
    }
    // TODO try not to fit if no data come
    if (network) setTimeout(() => network.fit(fitOption), 1000)
  }, [nodes, network])
  useEffect(() => {
    // componentWillUnmount
    return () => {
      nodesSet.clear()
      edgesSet.clear()
    }
  }, [])
  nodesSet.update([...nodes]) // doesn't remove not included address
  edgesSet.update(edges)
  return (
    <div ref={ref} className={classes.root}>
      {/*{network && createPortal(null, network.dom.background)}*/}
    </div>
  )
}

export default Network
