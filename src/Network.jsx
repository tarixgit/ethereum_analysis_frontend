import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { createPortal } from 'react-dom'
import * as vis from 'vis-network'

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

function useHookWithRefCallback(nodes, edges, loadMore) {
  const ref = useRef(null)
  let network = null

  const onContextBounded = useCallback(
    props => {
      const { event, nodes, edges, pointer } = props

      const nodeId = network.getNodeAt(pointer.DOM)
      if (nodeId) {
        network.selectNodes([nodeId])
        loadMore(nodeId)
      }
      console.log(nodeId)
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
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef, network]
}

const nodesSet = new vis.DataSet([])
const edgesSet = new vis.DataSet([])

const Network = ({ nodes, edges, loadMore }) => {
  const [ref, network] = useHookWithRefCallback(nodesSet, edgesSet, loadMore)
  nodesSet.update(nodes)
  edgesSet.update(edges)
  return (
    <div ref={ref} style={{ height: '100%' }}>
      {/*{network && createPortal(null, network.dom.background)}*/}
    </div>
  )
}

export default Network
