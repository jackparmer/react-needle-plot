/* global Plotly:true */
import React, { Component } from 'react';

/* Plotly imports */
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent(Plotly);

class MutationsNeedlePlot extends Component {
  render() {
    let cleanedX = [];
    this.props.x.forEach(dx => {
      if (dx.toString().includes('-')) {
        const endPts = dx.split('-').map(Number);
        // console.warn(endPts);
        const xAvg = (endPts[0] + endPts[1])/2;
        cleanedX.push(xAvg);
      }
      else {
        cleanedX.push(Number(dx));
      }
    });
    let stemsX = [];
    let stemsY = [];
    let regionAnnotations = [];
    let sequenceRegions = [];
    let shapes = [];
    const Y_DATA_MAX = Math.max.apply(null, this.props.y);
    const X_DATA_MAX = Math.max.apply(null, cleanedX.filter(Boolean));
    const X_DATA_MIN = Math.min.apply(null, cleanedX.filter(Boolean));
    const Y_BUFFER = Y_DATA_MAX/10;
    const Y_TOP = Y_DATA_MAX + Y_BUFFER;
    const REGION_LABEL_OFFSET = Y_BUFFER/-2;
    const REGION_COLORS = ["#8dd3c7","#ffffb3","#bebada","#fb8072",
                           "#80b1d3","#fdb462","#b3de69","#fccde5",
                           "#d9d9d9","#bc80bd","#ccebc5","#ffed6f",
                           "#8dd3c7","#ffffb3","#bebada","#fb8072",
                           "#80b1d3","#fdb462","#b3de69"];
    const mutationCount = [{
      text: `<b>${cleanedX.length} Mutations</b>`,
      x: 0.01, xref: 'paper',
      y: 1.1, yref: 'paper',
      showarrow: false,
      align: 'left',
    }];
    cleanedX.forEach(dx => {
      stemsX = stemsX.concat([dx, dx, NaN]);
    });
    this.props.y.forEach(dy => {
      stemsY = stemsY.concat([dy, 0, NaN]);
    });

    this.props.regions.forEach((rg, i) => {
      let x0 = Number(rg.coord.split('-')[0]);
      let x1 = Number(rg.coord.split('-')[1]);
      let regionLength = x1-x0;
      const XSPAN = X_DATA_MAX-X_DATA_MIN;
      sequenceRegions.push({
        x: [x1, x0],
        y: [Y_TOP, Y_TOP],
        name: rg.name,
        fill: 'tozeroy',
        mode: 'lines',
        opacity: 0.5,
        visible: 'legendonly',
        legendgroup: rg.name,
        marker: {color: REGION_COLORS[i]}
      });
      shapes.push({
        type: 'rect',
        x0: x0,
        x1: x1,
        y0: -0.1,
        y1: Y_BUFFER*-1,
        fillcolor: REGION_COLORS[i],
        line: {width: 0}
      })
      regionAnnotations.push({
        x: (x0 + x1)/2,
        y: REGION_LABEL_OFFSET,
        showarrow: false,
        text: regionLength > 0.05*(X_DATA_MAX-X_DATA_MIN) ? rg.name : '',
      })
    });

    return (
      <div className="App">
        <Plot
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: cleanedX,
              y: this.props.y,
              transforms: [{
                type: 'groupby',
                groups: this.props.groups,
                nameformat: `%{group}`
              }]
            }, {
              type: 'scatter',
              mode: 'lines',
              x: stemsX,
              y: stemsY,
              name: 'Stems',
              marker: {color: this.props.stemColor || '#444'},
              line: {width: 0.5}
            }
          ].concat(sequenceRegions)}

          layout={{...{
            legend: {
              orientation: 'v', x: 1, y: 1.05,
              bgcolor: 'rgba(255, 255, 255, 0)'
            },
            hovermode: 'closest',
            xaxis: {
              rangeslider: {},
              title: this.props.xaxis,
              zeroline: false,
              showgrid: false
            },
            yaxis: {
              fixedrange: true,
              autorange: false,
              range: [0-Y_BUFFER, Y_TOP],
              title: this.props.yaxis,
              showgrid: false,
              ticks: 'inside'
            },
            margin: {t:100, l:40, r:0, b:40},
            height: 600,
            width: 900,
            shapes: shapes,
            annotations: regionAnnotations.concat(mutationCount)
          }, ...this.props.layout}}
        />
      </div>
    );
  }
}

export default MutationsNeedlePlot;

