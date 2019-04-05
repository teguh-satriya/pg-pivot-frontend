import React, {useEffect, useState} from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import {getIntrospectionQuery, buildClientSchema} from 'graphql';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import {FlattenObject} from './Helper'

import 'graphiql/graphiql.css';
import './App.css';


function fetcher(params: Object): Promise<any> {
  return fetch('http://206.189.81.53:1000/graphql',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
  )
  .then(function(response) {
    return response.text();
  })
  .then(function(responseBody) {
    try {
      return JSON.parse(responseBody);
    } catch (e) {
      return responseBody;
    }
  });
}

export default () => {
  const [schema, setSchema] = useState(null);
  const [query, setQuery] = useState('');
  const [explorerIsOpen, setExplorerIsOpen] = useState(true);
  const [data, setData] = useState([]);
  const PlotlyRenderers = createPlotlyRenderers(Plot);

  let _graphiql: GraphiQL;

  useEffect(() => {
    fetcher({
      query: getIntrospectionQuery(),
    }).then(result => {
      setSchema(buildClientSchema(result.data));
    });
  }, [])

  return <div className="graphiql-container">
  <GraphiQLExplorer
    schema={schema}
    query={query}
    onEdit={(query:any) => setQuery(query)}
    explorerIsOpen={explorerIsOpen}
    onToggleExplorer={() => setExplorerIsOpen(!explorerIsOpen)}
  />
  <GraphiQL
    ref={ (ref:any) => (_graphiql = ref)}
    fetcher={(params: Object) => fetcher({query:query})
      .then(result =>{
        let queryData = result.data;
        if(queryData.__schema === undefined)
        {
          let tableData:any = [];
          for(let [i,dat] of Object.entries(queryData))
          {
            let d = [];
            tableData = [];
            for(let [p,o] of Object.entries(dat))
            {
              let data = FlattenObject(o);
              tableData.push(data);
            }
          }
          
          setData(tableData);
        }
      })
    }
    schema={schema}
    query={query}
    onEditQuery={(query:any) => setQuery(query)}>
    <GraphiQL.Toolbar>
      <GraphiQL.Button
        onClick={() => _graphiql.handlePrettifyQuery()}
        label="Prettify"
        title="Prettify Query (Shift-Ctrl-P)"
      />
      <GraphiQL.Button
        onClick={() => setExplorerIsOpen(!explorerIsOpen)}
        label="Explorer"
        title="Toggle Explorer"
      />
    </GraphiQL.Toolbar>
  </GraphiQL>
  <div className="pivottable-container">
    <PivotTableUI
        data={data}
        onChange={(s:any) => setData(s)}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        {...data}
    />
  </div>
</div>;
}
