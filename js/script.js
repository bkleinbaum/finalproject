L.mapbox.accessToken = 'pk.eyJ1IjoiYms3NDEiLCJhIjoiZFNVcTNvdyJ9.h8G4i4ib7PicRCiejvZW6g';

var cartoLink = 'https://bk741.cartodb.com/api/v2/sql?q='
var cartoKeyGeo = '&api_key=510fe4b5c410a666cea4073681404e8ac73b7338&format=GeoJson'
var cartoKey = '&api_key=510fe4b5c410a666cea4073681404e8ac73b7338'
var councilMap = new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_council_map'+cartoKeyGeo);
var cbMap = new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_cb'+cartoKeyGeo); 


var councilDistrict;











  // Typical Leaflet setup
  // var map = L.map('map').setView([40.731649,-73.977814], 10);
  // L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
  //   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  //   maxZoom: 18
  // }).addTo(map);
  

  var map = L.map('map').setView([40.731649,-73.977814], 12);
  
  // Add a base layer. We're using Stamen's Toner:
  //  http://maps.stamen.com/#toner
L.mapbox.accessToken = 'pk.eyJ1IjoiYms3NDEiLCJhIjoiZFNVcTNvdyJ9.h8G4i4ib7PicRCiejvZW6g';
// Replace 'examples.map-i87786ca' with your map id.
var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/bk741.09c0a8ed/{z}/{x}/{y}.png').addTo(map);


// Create placeholder GeoJSON layer
var geoJsonLayer = L.geoJson(null).addTo(map);

//google autocomplete

  
// Add an event handler to the search input. When [enter] is
// pressed, call Nominatim to get the location searched for
$(':input[name=search]').keydown(function (e) {
  if (e.which === 13) {
  callNominatim($(this).val(), map, geoJsonLayer);
  }  
});
 
//create geocode function
function callNominatim(query, map, geoJsonLayer) {

//create links
var link = 'http://nominatim.openstreetmap.org/?format=json&addressdetails=1&polygon_geojson=1&q=';
var google = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=';  
var comma = ','; 
var reverse = 'http://nominatim.openstreetmap.org/reverse?format=json&lat='
var bis = 'http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro='
var zola = 'http://maps.nyc.gov/doitt/nycitymap/template?applicationName=ZOLA&searchType=AddressSearch&addressNumber='

//change files to geoJSON
var councilGeoJson = councilMap.toGeoJSON();
console.log(councilGeoJson);

var cbMapGeoJson = cbMap.toGeoJSON();


//do the work
$.getJSON(link+query)
  .done(function (data) {
  
    //create the layer

    var lat = data[0].lat;
    var long = data[0].lon;


    var house = data[0].address.house_number;
    var street = data[0].address.road;

    if (house === undefined){
      $.getJSON(reverse+lat+'&lon='+long+'&addressdetails=1')
        .done(function(data){
       
          var house = address[0].house_number
          var street = address[0].road
          });
    } 
    else{
        console.log(lat)
    };



    var lat1 = JSON.parse(lat);
    var long1 = JSON.parse(long);
  

    var lat= data[0].lat;
    var long = data[0].lon;


    geoJsonLayer.clearLayers();
    map.setView([lat, long]);
    map.setZoom(18); 
    geoJsonLayer.addData(data[0].geojson);
    //create the point
    var coord = [turf.point([long1, lat1])];
    var search = turf.featurecollection(coord);
    
    
    //create streetview
    $(".streetview").attr('src', google+lat+comma+long);
    $(".streetview").show();
    
    //clear previous info
    //$("#info").text('');
    //tag the point

    var tagged = turf.tag(search, councilGeoJson,
                      'name', 'cDist');  

    var taggedCB = turf.tag(tagged, cbMapGeoJson,'borocb', 'cb');
    console.log("taggedCB", taggedCB)

    councilDistrict = taggedCB.features[0].properties.cDist
    console.log("council",councilDistrict);

    var commBoard = taggedCB.features[0].properties.cb


//set district color
    function districtStyle(feature) {
      return {
        fillColor: '#DE3385',
        fillOpacity: .3,
        color:'#FFA6D1',
        };
      }

//set full map color
function getDistrict(d) {
    return  d == councilDistrict ? '#DE3385' :
                        '#ff7f00';           
}


function fullMapStyle(feature) {
 
    console.log("name",councilDistrict)
      return {
        fillColor: getDistrict(feature.properties.name),
        fillOpacity: .3,
        color:'#FFA6D1',
        };
      }

//set features

function makeCouncil (feature,layer) { 
  console.log("blah",feature.properties.name)
  councilMap.bindPopup("<b> Council District: </b>"+feature.properties.name

    )};



//load the info

    var council =  new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_council_map where name ='+councilDistrict+cartoKeyGeo, {style:districtStyle})
      .on('data:loaded', function() {
        var councilInfo = council.toGeoJSON();
        console.log("councilInfo",councilInfo);
        $(".CDname").text('');
        $(".CDdistrict").text('');
        $(".CDwebsite").text('');
        $(".CDname").append(councilInfo.features[0].properties.member)
        $(".CDdistrict").append(councilInfo.features[0].properties.name);
        $(".CDwebsite").append(councilInfo.features[0].properties.website);
      }); 

     var CB =  new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_cb where borocb ='+commBoard+cartoKeyGeo, {style:districtStyle})
      .on('data:loaded', function() {
        var cbInfo = CB.toGeoJSON();
        console.log(cbInfo);
        $(".CBname").text('');
        $(".CBwebsite").text('');
        $(".BIS").text('')
        $(".zola").text('')
        $(".CBname").append(cbInfo.features[0].properties.cb);
        $(".CBwebsite").append(cbInfo.features[0].properties.web)
        $(".BIS").append("<a href='"+bis+cbInfo.features[0].properties.boro+'&houseno='+house+'&street='+street+'&go2=+GO+&requestid=0'+"' target="+"'blank'>"+"BIS"+"</a>")
        $(".zola").append("<a href='"+zola+house+'&street='+street+'&borough='+cbInfo.features[0].properties.boroname+"' target="+"'blank'>"+"ZoLa"+"</a>")
        //show the infobox when everything loads
        $("#info").show();
      }); 


//set CLICKING

      $('.cDistMap').click(function(){
        event.preventDefault();
        if(map.hasLayer(council)) {
            $(this).removeClass('selected');
            map.removeLayer(council);
            $(this).css({'background-color':'#B1ACBD'});
        
       } else {
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.addLayer(council);
            map.fitBounds(council.getBounds());        
        }

      });

        
         
       $('.cbMap').click(function(){
         event.preventDefault();
        if(map.hasLayer(CB)) {
            $(this).removeClass('selected');
            map.removeLayer(CB);
            $(this).css({'background-color':'#B1ACBD'});
        
       } else {
            map.removeLayer(councilMap);
            map.removeLayer(council);
            map.addLayer(CB);
            map.fitBounds(CB.getBounds());        
        }    
        });
        
       $('.allCouncil').click(function(){
         event.preventDefault();
            if(map.hasLayer(councilMap)) {
            $(this).removeClass('selected');
            map.removeLayer(councilMap);
            $(this).css({'background-color':'#B1ACBD'});
        
       } else {
            councilMap.setStyle(fullMapStyle);
            map.removeLayer(council);
            map.removeLayer(CB);
            map.addLayer(councilMap)
            councilMap.makeCouncil(makeCouncil);
            map.fitBounds(council.getBounds());        
            }    
      });
      


    });


}


