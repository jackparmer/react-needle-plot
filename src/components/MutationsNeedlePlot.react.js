/* global Plotly:true */
import React, { Component } from 'react';

import {debounce} from 'throttle-debounce';

/* Plotly imports */
import createPlotlyComponent from 'react-plotly.js/factory'
const Plot = createPlotlyComponent(Plotly);

class MutationsNeedlePlot extends Component {

  constructor(props) {
    super(props);
    this.state = {
      xStart: null,
      xEnd: null
    };
  }

  handleChange = debounce(300, e => {
    if (!this.props.onChange) {
      return;
    }
    if (e.points) {
      this.props.onChange({
        eventType: 'Click',
        curveNumber: e.points[0].curveNumber,
        x: e.points[0].x,
        y: e.points[0].y
      });
    }
    else if (e['xaxis.range[0]'] || e['xaxis.range']) {
      this.setState({
        xStart: e['xaxis.range[0]'] || e['xaxis.range'][0],
        xEnd: e['xaxis.range[1]'] || e['xaxis.range'][1]
      });
      this.props.onChange({
        eventType: 'Zoom',
        xStart: e['xaxis.range[0]'] || e['xaxis.range'][0],
        xEnd: e['xaxis.range[1]'] || e['xaxis.range'][1]
      });
    }
    else if (e['xaxis.autorange'] === true) {
      this.setState({
        xStart: null,
        xEnd: null
      });
      this.props.onChange({
          eventType: 'Autoscale',
      });
    }
    else {
      this.props.onChange(e);
    }
  })

  render() {
    let cleanedX = [];
    this.props.x.forEach(dx => {
      if (dx.toString().includes('-')) {
        const endPts = dx.split('-').map(Number);
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
    const DEFAULT_REGION_COLORS = ["#8dd3c7","#ffffb3","#bebada","#fb8072",
                           "#80b1d3","#fdb462","#b3de69","#fccde5",
                           "#d9d9d9","#bc80bd","#ccebc5","#ffed6f",
                           "#8dd3c7","#ffffb3","#bebada","#fb8072",
                           "#80b1d3","#fdb462","#b3de69"];
    const DEFAULT_NEEDLE_COLORS = ["#e41a1c","#377eb8","#4daf4a","#984ea3",
                           "#ff7f00","#ffff33","#a65628","#f781bf","#999999",
                           "#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00",
                           "#ffff33","#a65628","#f781bf","#999999","#e41a1c"]

    let REGION_COLORS = this.props.regionColors || DEFAULT_REGION_COLORS;
    let NEEDLE_COLORS = this.props.needleColors || DEFAULT_NEEDLE_COLORS;
    const mutationCountAnnotation = [{
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
          onClick={this.handleChange}
          onRelayout={this.handleChange}
          data={[
            {
              type: 'scatter',
              mode: 'markers',
              x: cleanedX,
              y: this.props.y,
              transforms: [{
                type: 'groupby',
                groups: this.props.groups,
                nameformat: `%{group}`,
                styles: [...new Set(this.props.groups)].map((target, i) => {
                  return {target: target, value: {marker: {color: NEEDLE_COLORS[i]}}}
                })
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
              showgrid: false,
              autorange: Boolean(!this.state.xStart),
              range: [this.state.xStart, this.state.xEnd]
            },
            yaxis: {
              fixedrange: true,
              autorange: false,
              range: [0-Y_BUFFER, Y_TOP],
              title: this.props.yaxis,
              showgrid: false,
              ticks: 'inside'
            },
            updatemenus: [{
              buttons:[{args:['xaxis.autorange', true], label: 'Autoscale', 'method': 'relayout'}],
              type: 'buttons',
              x: 0.3,
              y: 1.1,
              font: {color: '#444'},
              bgcolor: 'rgba(0,0,0,0)'
            }],
            margin: {t:100, l:40, r:0, b:40},
            height: 600,
            width: 900,
            shapes: shapes,
            annotations: regionAnnotations.concat(mutationCountAnnotation)
          }, ...this.props.layout}}
        />
      </div>
    );
  }
}

export default MutationsNeedlePlot;

