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
