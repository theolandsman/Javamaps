<script type="text/javascript">
  function getIBump(){
    iBumpVal= document.querySelector('input[name="radio"]:checked').value;
    return iBumpVal;
  }
  function calcIBump(feature){
    if(feature.open==1){
      return 0;
    }else if(getIBump()==0){
      return 0;
    }else if(feature.yearFirstE>2014){
      if(feature.party=="(D)"){
        return feature.POAC*100+getIBump()*.15;
      }else{
        return feature.POAC*100+getIBump()*-.15;
      }
    }else{
      if(feature.party=="(D)"){
        return feature.POAC*100 +getIBump()*.85;
      }else{
        return feature.POAC*100 +getIBump()*-.85;
      }
    }
  }
  function getProj(props){
    return props.partisan*100 +(npp-50)+calcIBump(props) ;
  }

  function percentStyling(number,n){
    if(n==1){
      if(number>100){
        return "100%";
      }else if(number>=50){
        return "D+"+(number-50).toFixed(1) +"%";
      }else{
        return "R+"+(50-number).toFixed(1) +"%";
      }
    }else if(n==3){
      if(number>=50){
        if((safeD+leanD+tossupD)>=436){
          return (number).toFixed(1) +"% Democratic Year (D control)";
        }else{
          return (number).toFixed(1) +"% Democratic Year (R control)";
        }
      }else{
        if((safeD+leanD+tossupD)>=436){
          return 100-(number).toFixed(1) +"% Republican Year (D control)";
        }else{
          return 100-(number).toFixed(1) +"% Republican Year (R control)";
        }
      }
    }else{
      if(number>100){
        return "Democrat with 100% (Safe D)";
      }else if(number>56){
        return "Democrat with "+(number).toFixed(1) +"% (Safe D)";
      }else if(number>=53){
        return "Democrat with "+(number).toFixed(1) +"% (Lean D)";
      }else if(number>=50){
        return "Democrat with "+(number).toFixed(1) +"% (Tossup D)";
      }else if(number>=47){
        return "Republican with "+(100-number).toFixed(1) +"% (Tossup R)";
      }else if(number>=44){
        return "Republican with "+(100-number).toFixed(1) +"% (Lean R)";
      } else if (number<0){
        return "Republican with 100% (Safe R)";
      }else{
        return "Republican with "+(100-number).toFixed(1) +"% (Safe R)";
      }
    }
  }

  var npp =50; /* set default value for National party preference */

  // control that shows state info on hover
  var info = L.control();
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  info.update = function (props) {
    this._div.innerHTML =  (props ?
                            '<b>' + props.NAME +' '+(props.Incumbent) +' '+(props.party)+'</b><br />'
                            +'District Partisanship:' +percentStyling(props.partisan*100,1) +'%.' +'('+props.pRating+')'+'</b><br />' +
                            'Projection:  ' +percentStyling(getProj(props),2)+'</b><br />' + "High Confidence Projection: "+props.highConf: 'Hover over a district');
  };



  //This function determines how districts are shaded.
  function getColor(d) {
    return d > .56 ? '#0739ff' :
    d > .53  ? '#6c96ff' :
    d > .5  ? '#C297DB' :
    d > .47  ? '#C297DB' :
    d > .44   ? '#ff5a48' :
    d=="D" ? '#0739ff' :
    d== "R"?  '#ba0c00':
    d=="No projection"? '#C297DB':
    '#ba0c00';
  }
  function getMod(feature){
    if(calcIBump(feature)==0){
      return "N/A";
    }else{
      if(feature.party=="(R)"){
        return -calcIBump(feature).toFixed(1);
      }else{
        return calcIBump(feature).toFixed(1);
      }
    }
  }

  var safeD = 0;
  var leanD = 0;
  var tossupD = 0;
  var tossupR =0;
  var leanR=0;
  var safeR=0;
  function getProjection(feature,id){
    var projection = (feature.partisan*100 +(npp-50)+calcIBump(feature))/100
    if(projection>.56){
      safeD = safeD +1 ;
    } else  if(projection>=.53){
      leanD = leanD +1;
    } else  if(projection>=.5){
      tossupD = tossupD +1;
    } else  if(projection>=.47){
      tossupR = tossupR +1;
    } else  if(projection>=.44){
      leanR = leanR +1;
    } else{
      safeR = safeR +1;
    }
    if(id==1){
      var table = document.getElementById("endTable");
      var row =table.insertRow()
      row.innerHTML = "<td style='color: #000'>"+feature.NAME+"</td><td style='color: #000'>"+feature.Incumbent+" "+feature.party+"</td><td style=background-color:"+getColor(feature.partisan)+">"+
        percentStyling(feature.partisan*100,1)+"</td><td style='color: #000'>"+getMod(feature) +"</td><td style=background-color:"+getColor(projection)+">"+
        percentStyling(projection*100,2)+"</td><td style=background-color:"+getColor(feature.highConf)+">"+feature.highConf+"</td>";
    }
    return projection;
  }

  //Code below sends each district to the shader function, it has also been modified to
  //compile a running tally of Democratic and Republican seats
  function style(feature) {
    var projection = getProjection(feature.properties,1);
    return {
      fillColor: getColor(projection, npp),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: .9
    };
  }
  function style2(feature) {
    var projection = getProjection(feature.properties,2);
    return {
      fillColor: getColor(projection, npp),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: .9
    };
  }
  //creates shading for state boundary lines
  var statestyle  = {
    "color": "black",
    "weight": 3,
    "opacity": 1,
  };

  //allows map to be interactive, determines what happens when you highlight a feature
  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      weight: 7,
      color: '#666',
      dashArray: '',
      fillOpacity: 1
    });


    info.update(layer.feature.properties);
  }

  var geojson;

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds(),{maxZoom: 7});
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }
  //creates initial state of map
  congmapjson = L.geoJson(CongressMapData, {style: style2,onEachFeature: onEachFeature});
  geojson = L.geoJson(CongressData, {style: style,onEachFeature: onEachFeature});
  statejson = L.geoJson(StateData, {style: statestyle,onEachFeature: function(feature,layer){layer.on({
    click: zoomToFeature
  });}});
  mapstatejson  = L.geoJson(statesData, {style: statestyle,onEachFeature: function(feature,layer){layer.on({
    click: zoomToFeature
  });}});
  var cartogram = L.layerGroup([geojson, statejson]);
  var geography = L.layerGroup([congmapjson, mapstatejson]);
  var map = L.map('map',{maxZoom: 7, minZoom:4, maxBounds: [[90, -164],[10,-56]]}).setView([38.8, -96], 4.5); /*creates the map pane with a US centric view window */
  var layers = {"Equal Area Projection": cartogram, "Actual Geography":geography};
  cartogram.addTo(map);
  var control =  L.control.layers(layers,null, {position:'bottomleft'}).addTo(map);
  info.addTo(map);
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<table><tr><th></th><th style= "background-color:#0739ff"> Democrats </th>'+
      '<th style= "background-color:#ba0c00">Republicans</th></tr><tr><td style="color: #000">Safe</td>'+
      '<td style= "background-color:#0739ff">'+safeD/2+'</td><td style= "background-color:#ba0c00">'+safeR/2+'</td></tr>'+
      '<tr><td style="color: #000">Lean</td><td style= "background-color:#6c96ff">'+leanD/2+'</td>'+
      '<td style= "background-color:#ff5a48">'+leanR/2+'</td></tr>' +
      '<tr><td style="color: #000">Tossup</td><td style= "background-color:#C297DB">'+tossupD/2+'</td>'+
      '<td style= "background-color:#C297DB">'+tossupR/2+'</td></tr></table>';
    return div;
  };
  legend.addTo(map);
  var slider = document.getElementById("myRange");
  var ratio =document.getElementById("ratio");
  var output = document.getElementById("demo");
  var democrats = document.getElementById("democrats");
  var republicans = document.getElementById("republicans");
  var democratsP = document.getElementById("democratsP");
  var republicansP = document.getElementById("republicansP");
  var safeDBar = document.getElementById("safeD");
  var leanDBar = document.getElementById("leanD");
  var tossupDBar = document.getElementById("tossupD");
  var tossupRBar = document.getElementById("tossupR");
  var leanRBar = document.getElementById("leanR");
  var table = document.getElementById("endTable");
  output.innerHTML = percentStyling((slider.value)/10,3); // Display the default slider value
  ratio.innerHTML= "50-50";
  democrats.innerHTML = 193; //Initialize default values for table variables
  democratsP.innerHTML = 44.4;
  republicans.innerHTML =  242;
  republicansP.innerHTML = 55.6;
  safeDBar.style.width = ((safeD/870)*100).toFixed(1) + '%';
  leanDBar.style.width = ((leanD/870)*100).toFixed(1) + '%';
  tossupDBar.style.width = ((tossupD/870)*100).toFixed(1) + '%';
  tossupRBar.style.width = ((tossupR/870)*100).toFixed(1) + '%';
  leanRBar.style.width = ((leanR/870)*100).toFixed(1) + '%';
  // Update the current slider value (each time you drag the slider handle)
  // Slider code includes codes for basically all elements of the page, so that they all update when
  //The slider is moved
  function remap(npp){
    rnpp=100-npp;
    safeD = 0;
    leanD =0;
    tossupD =0;
    tossupR = 0;
    leanR=0;
    safeR=0;
    map.removeLayer(legend);
    table.innerHTML= "<tr><th style='color: #000'> District </th><th style='color: #000'>Incumbent</th>"+
      "<th style='color: #000'>District Partisanship</th><th style='color: #000'>Incumbent Modifer</th>"+
      "<th style='color: #000'> Projection for a "+npp +"-"+rnpp+ " Year</th>"+
      "<th style='color: #000'> High Confidence Projection</th> </tr>";
    if(map.hasLayer(cartogram)){
      map.removeLayer(cartogram);
      control.removeLayer(cartogram);
      geojson = L.geoJson(CongressData, {style: style,onEachFeature: onEachFeature});
      congmapjson = L.geoJson(CongressMapData, {style: style2,onEachFeature: onEachFeature});
      statejson = L.geoJson(StateData, {style: statestyle,onEachFeature: function(feature,layer){layer.on({click: zoomToFeature});}});
      cartogram = L.layerGroup([geojson, statejson]).addTo(map);
      layers = {"Equal Area Projection": cartogram, "Actual Geography":geography};
      control.addBaseLayer(cartogram, "Equal Area Projection");

    } else {
      map.removeLayer(geography);
      control.removeLayer(geography);
      congmapjson = L.geoJson(CongressMapData, {style: style2,onEachFeature: onEachFeature});
      geojson = L.geoJson(CongressData, {style: style,onEachFeature: onEachFeature});
      mapstatejson  = L.geoJson(statesData, {style: statestyle,onEachFeature: function(feature,layer){layer.on({click: zoomToFeature});}});
      geography = L.layerGroup([congmapjson, mapstatejson]).addTo(map);
      layers = {"Equal Area Projection": cartogram, "Actual Geography":geography};
      control.addBaseLayer(geography, "Actual Geography");
    }
    if((safeD+leanD+tossupD)>217){
      democrats.innerHTML = (safeD+leanD+tossupD)/2;
      republicans.innerHTML= (safeR+leanR+tossupR)/2;
    } else{
      democrats.innerHTML = (safeD+leanD+tossupD)/2;
      republicans.innerHTML= (safeR+leanR+tossupR)/2;
    }
    democratsP.innerHTML = (((safeD+leanD+tossupD)/870)*100).toFixed(1);
    republicansP.innerHTML = (((safeR+leanR+tossupR)/870)*100).toFixed(1);
    ratio.innerHTML = npp + "-" +rnpp;
    safeDBar.style.width = ((safeD/870)*100).toFixed(1) + '%';
    leanDBar.style.width = ((leanD/870)*100).toFixed(1) + '%';
    tossupDBar.style.width = ((tossupD/870)*100).toFixed(1) + '%';
    tossupRBar.style.width = ((tossupR/870)*100).toFixed(1) + '%';
    leanRBar.style.width = ((leanR/870)*100).toFixed(1) + '%';
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = '<table><tr><th></th><th style= "background-color:#0739ff"> Democrats </th>'+
        '<th style= "background-color:#ba0c00">Republicans</th></tr><tr><td style="color: #000">Safe</td>'+
        '<td style= "background-color:#0739ff">'+safeD/2+'</td><td style= "background-color:#ba0c00">'+safeR/2+'</td></tr>'+
        '<tr><td style="color: #000">Lean</td><td style= "background-color:#6c96ff">'+leanD/2+'</td>'+
        '<td style= "background-color:#ff5a48">'+leanR/2+'</td></tr>' +
        '<tr><td style="color: #000">Tossup</td><td style= "background-color:#C297DB">'+tossupD/2+'</td>'+
        '<td style= "background-color:#C297DB">'+tossupR/2+'</td></tr></table>';
      return div;
    };
    legend.addTo(map);
  }
  slider.oninput = function() {
    npp = (this.value)/10;
    sl = document.getElementById("slideLabel");
    if(npp<50){
      sl.style.float = "right"
      sl.style.left = "-10px"
    }else{
      sl.style.float = "left"
      sl.style.left = "10px"
    }
    remap(npp);
    output.innerHTML = percentStyling(npp,3);

  }
  function changeIBump(){
    getIBump();
    remap(npp);
  }

  map.attributionControl.addAttribution('Underlying Data and Shapefile from DailyKos');


</script>
