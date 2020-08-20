import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import * as vis from 'vis-network'
import { makeStyles } from '@material-ui/core/styles'
import { networkOptions } from './config'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
  },
}))

const legend = new vis.DataSet([
  {
    id: 100,
    x: 25,
    y: 25,
    shape: 'star',
    label: 'Scam',
    group: 'internet',
    value: 1,
    fixed: true,
    physics: false,
  },
  {
    id: 101,
    x: 25,
    y: 100,
    label: 'Not scam',
    group: 'internet',
    value: 1,
    fixed: true,
    physics: false,
  },
])
const nodesSet = new vis.DataSet([])
const edgesSet = new vis.DataSet([])

function useBuildLegendHook(legend) {
  const ref = useRef(null)
  let network = null

  const setRef = useCallback(node => {
    if (node) {
      const width = 70
      const height = 180
      network = new vis.Network(
        node,
        { nodes: legend, edges: [] },
        {
          ...networkOptions,
          width,
          height,
          clickToUse: false,
          autoResize: false,
          interaction: {
            dragNodes: false,
            navigationButtons: true,
            zoomView: false, // do not allow zooming
            dragView: false, // do not allow dragging
          },
          manipulation: {
            enabled: false,
          },
          nodes: {
            ...networkOptions.nodes,
            size: 10,
            chosen: false,
            shadow: { enabled: true, size: 8 },
            heightConstraint: { minimum: 25 },
            widthConstraint: { minimum: 15, maximum: 25 },
            labelHighlightBold: true,
          },
        }
      )
      network.moveTo({
        position: { x: 0, y: 0 },
        offset: { x: -width / 2, y: -height / 2 },
        scale: 1,
      })
    }
    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef]
}

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
      network.on('configChange', function() {
        // this will immediately fix the height of the configuration
        // wrapper to prevent unecessary scrolls in chrome.
        // see https://github.com/almende/vis/issues/1568
        var div = node.getElementsByClassName('vis-configuration-wrapper')[0]
        div.style['height'] = div.getBoundingClientRect().height + 'px'
      })
      setNetworkForAnswer(network)
    }
    // Save a reference to the node
    ref.current = node
  }, [])

  return [setRef, ref, networkForAnswer]
}

const Network = ({ nodes, edges, loadMore, labels, direction }) => {
  const classes = useStyles()
  const [ref, refObject, network] = useBuildNetworkHook(
    nodesSet,
    edgesSet,
    loadMore
  )
  const [refLeg] = useBuildLegendHook(legend)
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
  if (network) {
    if (Number(direction)) {
      const edgesConfig = networkOptions.edges
      edgesConfig.arrows = {
        to: {
          enabled: true,
          type: 'vee',
          scaleFactor: 3,
        },
      }
      network.setOptions({
        ...networkOptions,
        edges: edgesConfig,
      })
    } else {
      const edgesConfig = networkOptions.edges
      edgesConfig.arrows = {
        to: false,
      }
      network.setOptions({
        ...networkOptions,
        edges: edgesConfig,
      })
    }
    if (nodes.length > 1000) {
      network.setOptions({
        ...networkOptions,
        improvedLayout: false,
        edges: {
          width: 0.15,
          color: { inherit: 'from' },
          smooth: {
            enabled: false,
          },
        },
        physics: {
          stabilization: true,
          barnesHut: {
            gravitationalConstant: -80000,
            springConstant: 0.001,
            springLength: 250,
          },
          // minVelocity: 1,
          timestep: 0.4,
        },
        interaction: {
          dragNodes: false,
          navigationButtons: false,
          hideEdgesOnDrag: true,
        },
      })
    }
  }
  return (
    <Fragment>
      <div ref={ref} className={classes.root}>
        {/*{network && createPortal(null, network.dom.background)}*/}
      </div>
      <div
        ref={refLeg}
        style={{
          height: 150,
          width: 70,
          position: 'absolute',
          right: 10,
          top: 120,
        }}
      ></div>
    </Fragment>
  )
}

export default Network
