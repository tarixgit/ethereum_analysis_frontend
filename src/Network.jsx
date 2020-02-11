import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { createPortal } from 'react-dom'
import * as vis from 'vis-network'
import { map, sortBy } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'

const options = {
  nodes: {
    shape: 'dot',
    // height: '100%',    must be setted
    // width: '100%'
    scaling: {
      min: 10,
      max: 30,
    },
    // size: 16
  },
  edges: {
    width: 0.15,
    color: { inherit: 'from' },
    smooth: {
      type: 'continuous',
    },
  },
  physics: {
    stabilization: false,
    barnesHut: {
      gravitationalConstant: -80000,
      springConstant: 0.001,
      springLength: 200,
    },
  },
  interaction: {
    dragNodes: false,
    navigationButtons: true,
  },
  // groups: {
  //   0: { color: { background: '#97c2fc' } },
  //   1: { color: { background: '#004586' } },
  //   2: { color: { background: '#669933' } },
  //   3: { color: { background: '#fb2227' } },
  //   4: { color: { background: '#33cc66' } },
  //   5: { color: { background: '#993399' } },
  //   6: { color: { background: '#ffff00' } },
  //   7: { color: { background: '#339999' } },
  //   8: { color: { background: '#006666' } },
  //   9: { color: { background: '#ffff00' } },
  // },
  /*  physics: {
    forceAtlas2Based: {
      gravitationalConstant: -2006,
      centralGravity: 0.005,
      springLength: 230,
      springConstant: 0.18,
    },
    maxVelocity: 146,
    solver: 'forceAtlas2Based', // barnesHut
    timestep: 0.35,
    stabilization: false,
  },*/
  // clustering: true, // doenst work
  /*
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    hideEdgesOnZoom: true
  }
*/
}
const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
}))

function useHookWithRefCallback(nodes, edges, loadMore) {
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
      // if (what === 'item' && !this.isBackground(id)) {
      // const item = nodesSet.get(id) || edgesSet.get(id)
      // const item = nodesSet.get(nodes[0]) // if null then item is array of all
      // onItemClick({ event }, item)
      // onContextClick(item, event.target)
      // }
    },
    [network, nodes, edges, loadMore]
  )

  const setRef = useCallback(node => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      network = new vis.Network(node, { nodes, edges }, options)
      network.on('oncontext', onContextBounded)
      setNetworkForAnswer(network)
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef, ref, networkForAnswer]
}

const nodesSet = new vis.DataSet([])
const edgesSet = new vis.DataSet([])
const getLabelNodes = (labels, refObject) => {
  const container = refObject.current
  const x = container.clientWidth - container.clientWidth / 2 - 30
  const y = -container.clientHeight + 150
  const step = 100
  return map(sortBy(labels, ['id']), ({ id, name }, index) => ({
    id: 1000000 + id,
    x: x,
    y: y + index * step,
    label: name,
    group: id,
    fixed: true,
    physics: false,
  }))
}

const Network = ({ nodes, edges, loadMore, labels }) => {
  let [nodeLabels, setNodeLabels] = useState([])
  const classes = useStyles()
  const [ref, refObject, network] = useHookWithRefCallback(
    nodesSet,
    edgesSet,
    loadMore
  )
  useEffect(() => {
    const fitOption = {
      nodes: nodesSet.getIds(),
    }
    if (network) network.fit(fitOption) // TODO hack setTimeout
    if (nodes.length && labels.length && network) {
      setNodeLabels(getLabelNodes(labels, refObject))
    }
  }, [nodes, network])
  // componentWillUnmount
  useEffect(() => {
    return () => {
      nodesSet.clear()
      edgesSet.clear()
    }
  }, [])

  nodesSet.update([...nodes, ...nodeLabels])
  edgesSet.update(edges)

  return (
    <div ref={ref} className={classes.root}>
      {/*{network && createPortal(null, network.dom.background)}*/}
    </div>
  )
}

export default Network
