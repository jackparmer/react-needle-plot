/* global Plotly:true */
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import MutationsNeedlePlot from './components/MutationsNeedlePlot.react.js';

import mutData1 from './data/TP53_MUTATIONS.json';
import regions1 from './data/TP53_REGIONS.json';
import mutData2 from './data/ENST00000557334.json';
import regions2 from './data/KRAS_protein.json';
import mutData3 from './data/muts.json';
import regions3 from './data/regions.json';

const DATA = [
  {mutData: mutData1, regions: regions1},
  {mutData: mutData2, regions: regions2},
  {mutData: mutData3, regions: regions3}
];

const DARK_THEME = {
    plot_bgcolor: 'black',
    paper_bgcolor: 'black',
    font: {color: 'white'},
    yaxis: {tickcolor: 'white'}
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: mutData1,
      regions: regions1,
      theme: {},
      events: []
    };
  }

  handleDataChange = e => {
    const i = Number(e.target.value);
    this.setState({
      data: DATA[i].mutData,
      regions: DATA[i].regions,
    });
  }

  handleThemeChange = e => {
    const theme = e.target.value;
    this.setState({
      theme: theme == 'dark' ? DARK_THEME : {}
    });
  }

  handleOnChange = e => {
    let events = this.state.events;
    events.unshift(JSON.stringify(e));
    this.setState({events: events});
  }

  render() {
    const stemColor = this.state.theme === DARK_THEME ? 'white' : 'black';
    return (
    	<div>
          <select onChange={this.handleDataChange}>
            <option value="0">TP53</option>
            <option value="1">ENST00000557334</option>
            <option value="2">Generic</option>
          </select>
          <select onChange={this.handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
	      <MutationsNeedlePlot 
	        x = {this.state.data.map(mut => mut.coord)}
	        y = {this.state.data.map(mut => mut.value)}
	        groups = {this.state.data.map(mut => mut.category)}
	        regions = {this.state.regions}
	        xaxis = 'Position'
	        yaxis = 'Number of mutations'
            stemColor = {stemColor}
            layout = {this.state.theme}
            onChange= {this.handleOnChange}
	      />
          <div style={{marginLeft:200}}>
            <p>Most Recent Event (click or zoom on plot):</p>
            <textarea
              style={{width:600, height:200, margin:'auto', fontSize:'14px'}}
              value={this.state.events.join('\n')}>
            </textarea>
          </div>
	    </div>
    );
  }
}

export default App;
