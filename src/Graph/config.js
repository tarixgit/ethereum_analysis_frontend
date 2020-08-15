export const networkOptions = {
  nodes: {
    shape: 'dot',
    // height: '100vh', //must be setted
    // width: '100vh',
    scaling: {
      min: 10,
      max: 30,
    },
    // size: 16
  },
  edges: {
    width: 0.15,
    selectionWidth: 2,
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
  groups: {
    0: {
      color: {
        border: '#2B7CE9',
        background: '#97C2FC',
        highlight: { border: '#2B7CE9', background: '#D2E5FF' },
        hover: { border: '#2B7CE9', background: '#D2E5FF' },
      },
    }, // 0: blue    None              [0, 3, 6, 1, 5, 2, 7, 8, 4, 9]
    1: {
      color: {
        border: '#4220FB',
        background: '#6E6EFD',
        highlight: { border: '#4220FB', background: '#9B9BFD' },
        hover: { border: '#4220FB', background: '#9B9BFD' },
      },
    }, // 1: yellow  Mining Pool
    2: {
      color: {
        border: '#41A906',
        background: '#7BE141',
        highlight: { border: '#41A906', background: '#A1EC76' },
        hover: { border: '#41A906', background: '#A1EC76' },
      },
    },
    3: {
      color: {
        border: '#FA0A10',
        background: '#FB7E81',
        highlight: { border: '#FA0A10', background: '#FFAFB1' },
        hover: { border: '#FA0A10', background: '#FFAFB1' },
      },
    }, // 3: green   Onetime
    4: {
      color: {
        border: '#4AD63A',
        background: '#C2FABC',
        highlight: { border: '#4AD63A', background: '#E6FFE3' },
        hover: { border: '#4AD63A', background: '#E6FFE3' },
      },
    }, // 4: magenta  Trace
    5: {
      color: {
        border: '#7C29F0',
        background: '#AD85E4',
        highlight: { border: '#7C29F0', background: '#D3BDF0' },
        hover: { border: '#7C29F0', background: '#D3BDF0' },
      },
    }, // 5: purple  Miner
    6: {
      color: {
        border: '#C37F00',
        background: '#FFA807',
        highlight: { border: '#C37F00', background: '#FFCA66' },
        hover: { border: '#C37F00', background: '#FFCA66' },
      },
    }, // 6: orange  Exchange
    7: {
      color: {
        border: '#E129F0',
        background: '#EB7DF4',
        highlight: { border: '#E129F0', background: '#F0B3F5' },
        hover: { border: '#E129F0', background: '#F0B3F5' },
      },
    }, // 7: darkblue  ERC20
    8: {
      color: {
        border: '#FD5A77',
        background: '#FFC0CB',
        highlight: { border: '#FD5A77', background: '#FFD1D9' },
        hover: { border: '#FD5A77', background: '#FFD1D9' },
      },
    }, // 8: pink   ERC721
    9: {
      color: {
        border: '#FFA500',
        background: '#FFFF00',
        highlight: { border: '#FFA500', background: '#FFFFA3' },
        hover: { border: '#FFA500', background: '#FFFFA3' },
      },
    }, // 9: mint  Genesis
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
