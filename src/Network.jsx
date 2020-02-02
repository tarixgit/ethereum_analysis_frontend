import React, { useCallback, useRef, useState } from 'react'
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
  /*  physics: {
    stabilization: false,
    barnesHut: {
      gravitationalConstant: -80000,
      springConstant: 0.001,
      springLength: 200,
    },
  },*/
  physics: {
    forceAtlas2Based: {
      gravitationalConstant: -26,
      centralGravity: 0.005,
      springLength: 230,
      springConstant: 0.18,
    },
    maxVelocity: 146,
    solver: 'forceAtlas2Based',
    timestep: 0.35,
    stabilization: { iterations: 150 },
  },
  /*
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    hideEdgesOnZoom: true
  }
*/
}

function useHookWithRefCallback() {
  const ref = useRef(null)
  const [network, setNetwork] = useState(null)
  const setRef = useCallback(node => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      setNetwork(new vis.Network(node, { nodes: [], edges: [] }, options))
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef, network]
}

const Network = ({ nodes, edges }) => {
  const [ref, network] = useHookWithRefCallback()
  if (!!network && nodes) {
    network.setData({ nodes, edges })
  }
  return (
    <div ref={ref} style={{ height: '100%' }}>
      {/*{network && createPortal(null, network.dom.background)}*/}
    </div>
  )
}

export default Network

/*
*  <div
        className={cn({
          focused: !!selectedItems.length,
          locked,
        })}
        ref={containerRef}
        style={positionRelative}
      >
        {this.$el && createPortal(headers, this.$el.dom.background)}
        {this.$el && this.renderGroups()}
      </div>
*
* */
