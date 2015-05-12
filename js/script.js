L.mapbox.accessToken = 'pk.eyJ1IjoiYms3NDEiLCJhIjoiZFNVcTNvdyJ9.h8G4i4ib7PicRCiejvZW6g';


//basic links
var cartoLink = 'https://bk741.cartodb.com/api/v2/sql?q='
var cartoKeyGeo = '&api_key=510fe4b5c410a666cea4073681404e8ac73b7338&format=GeoJson'
var cartoKey = '&api_key=510fe4b5c410a666cea4073681404e8ac73b7338'
var councilMap = new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_council_map'+cartoKeyGeo, {onEachFeature: makeCouncil});
var cbMap = new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_cb'+cartoKeyGeo, {onEachFeature:makeCB}); 

//make things global
var CB;
var council;



//set popups
function makeCouncil (feature,layer) { 
  layer.bindPopup(
    "<b>Council District: </b>"+feature.properties.name
    +"<br>"
    +"<b>Council Member: </b>"+feature.properties.member
    )};


function makeCB(feature,layer) { 
  layer.bindPopup(
    "<b> Community Board: </b>"+feature.properties.cb
      )};



var map = L.map('map').setView([40.731649,-73.977814], 12)
        

  
  // Add a base layer. We're using Stamen's Toner:
  //  http://maps.stamen.com/#toner
L.mapbox.accessToken = 'pk.eyJ1IjoiYms3NDEiLCJhIjoiZFNVcTNvdyJ9.h8G4i4ib7PicRCiejvZW6g';
// Replace 'examples.map-i87786ca' with your map id.
var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/bk741.09c0a8ed/{z}/{x}/{y}.png').addTo(map);

var sat = L.tileLayer('https://{s}.tiles.mapbox.com/v3/bk741.m44ejghn/{z}/{x}/{y}.png')
 
 L.control.geocoder({
       bbox:true, 
       placeholder: 'Search within the bounds' //map\'s view/bbox
        }).addTo(map);


// Create placeholder GeoJSON layer
var geoJsonLayer = L.geoJson(null).addTo(map);

  
// Add an event handler to the search input. When [enter] is
// pressed, call Nominatim to get the location searched for
$(':input[name=search]').keydown(function (e) {
  if (e.which === 13) {      
    //clear buttons
    $('.allCB').css({'background-color':'#B1ACBD'});
    $('.cbMap').css({'background-color':'#B1ACBD'});
    $('.cDistMap').css({'background-color':'#B1ACBD'});
    $('.allCouncil').css({'background-color':'#B1ACBD'});
    //run the function

    //clear layers  
   if(map.hasLayer(council)) {
            map.removeLayer(council);
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.removeLayer(cbMap);
            callNominatim($(this).val(), map);                    
            } 
        else if (map.hasLayer(councilMap)) {
            map.removeLayer(council);
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.removeLayer(cbMap);
            callNominatim($(this).val(), map);                    
            } 
        else if(map.hasLayer(CB)) {
            map.removeLayer(council);
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.removeLayer(cbMap);
            callNominatim($(this).val(), map);                    
            } 
        else if(map.hasLayer(CB)) {
            map.removeLayer(council);
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.removeLayer(cbMap);
            callNominatim($(this).val(), map);                    
            } 
        else if(map.hasLayer(cbMap)) {
            map.removeLayer(council);
            map.removeLayer(councilMap);
            map.removeLayer(CB);
            map.removeLayer(cbMap);
            callNominatim($(this).val(), map);                    
            } else {
      
        callNominatim($(this).val(), map);
        }   
  }  
});
 
//create geocode function
function callNominatim(query, map) {

 
   

    //create links
    var mapBox = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/'
    var mapBox2 ='.json?access_token=pk.eyJ1IjoiYms3NDEiLCJhIjoiZFNVcTNvdyJ9.h8G4i4ib7PicRCiejvZW6g'
    var google = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=';  
    var comma = ','; 
    var bis = 'http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?boro='
    var zola = 'http://maps.nyc.gov/doitt/nycitymap/template?applicationName=ZOLA&searchType=AddressSearch&addressNumber='

    //change files to geoJSON
    var councilGeoJson = councilMap.toGeoJSON();
    var cbMapGeoJson = cbMap.toGeoJSON();


    //do the work
    var geo =  new L.GeoJSON.AJAX (mapBox+query+mapBox2)
        .on('data:loaded', function() {
          var geoPoint = geo.toGeoJSON();
    
          //create the data
          var lat1 = geoPoint.features[0].geometry.coordinates[1];
          var long1 = geoPoint.features[0].geometry.coordinates[0]

          var house = geoPoint.features[0].address;
          var street = geoPoint.features[0].text;

          //create the marker
          map.setView([lat1, long1])
          map.setZoom(18); 

          geoJsonLayer.clearLayers();

          //create the point
          var coord = [turf.point([long1, lat1])];
          var search = turf.featurecollection(coord);

          geoJsonLayer.addData(search);

          //create streetview
          $(".streetview").attr('src', google+lat1+comma+long1);

    
           //tag the point
          var tagged = turf.tag(search, councilGeoJson,
                       'name', 'cDist');  

          var taggedCB = turf.tag(tagged, cbMapGeoJson,'borocb', 'cb');

          var councilDistrict = taggedCB.features[0].properties.cDist

          var commBoard = taggedCB.features[0].properties.cb

            //clear layers
      

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
              return {
                fillColor: getDistrict(feature.properties.name),
                fillOpacity: .3,
                color:'#FFA6D1',
                    };
          }

          //set CB Map color
          function getCBDistrict(d) {
              return  d == commBoard ? '#DE3385' :
                           '#ff7f00';           
          }

          function CBDistrictOpacity(d) {
              return  d == 0 ? 0 :
                           .3;           
          }



           function CBMapStyle(feature) {
            return {
              fillColor: getCBDistrict(feature.properties.borocb),
              fillOpacity: CBDistrictOpacity(feature.properties.borocb),
              color:'#FFA6D1',
              };
            }


        //set the styles
            cbMap.setStyle(CBMapStyle);  
            councilMap.setStyle(fullMapStyle);  
//load the info

            council =  new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_council_map where name ='+councilDistrict+cartoKeyGeo, {
                          style:districtStyle})
               .on('data:loaded', function() {
                  var councilInfo = council.toGeoJSON();
                  $(".CDname").text('');
                  $(".CDdistrict").text('');
                  $(".CDwebsite").text('');
                  $(".CDname").append(councilInfo.features[0].properties.member)
                  $(".CDdistrict").append(councilInfo.features[0].properties.name);
                  $(".CDwebsite").append("<a href='"+councilInfo.features[0].properties.website+"' target="+"'blank'>"+"Council Website"+"</a>");
                  }); 

            CB =  new L.GeoJSON.AJAX(cartoLink+'SELECT * FROM nyc_cb where borocb ='+commBoard+cartoKeyGeo, {style:districtStyle})
               .on('data:loaded', function() {
                  var cbInfo = CB.toGeoJSON();
                  console.log("CB",cbInfo.features[0].properties.cb);
                  $(".CBname").text('');
                  $(".CBwebsite").text('');
                  $(".BIS").text('')
                  $(".zola").text('')
                  $(".CBname").append(cbInfo.features[0].properties.cb);
                  $(".CBwebsite").append("<a href='"+cbInfo.features[0].properties.web+"' target="+"'blank'>"+"Community Board Website"+"</a>")
                  $(".BIS").append("<a href='"+bis+cbInfo.features[0].properties.boro+'&houseno='+house+'&street='+street+'&go2=+GO+&requestid=0'+"' target="+"'blank'>"+"Department of Building Information"+"</a>")
                  $(".zola").append("<a href='"+zola+house+'&street='+street+'&borough='+cbInfo.features[0].properties.boroname+"' target="+"'blank'>"+"Zoning Information"+"</a>")
                  $('.mapColor').css({'background-color':'#F56FFC'});
                  $('.satellite').css({'background-color':'#B1ACBD'});
                  //show the infobox when everything loads
                  $("#info").show();
                    }); 

      });
}

//set CLICKING

$('.cDistMap').click(function(){
      //event.preventDefault();
      if(map.hasLayer(council)) {
      $(this).removeClass('selected');
      map.removeLayer(council);
      $(this).css({'background-color':'#B1ACBD'});
        
      } else {
      map.removeLayer(councilMap);
      map.removeLayer(CB);
      map.removeLayer(cbMap);


      $(this).css({'background-color':'#F56FFC'});
      $('.allCB').css({'background-color':'#B1ACBD'});
      $('.allCouncil').css({'background-color':'#B1ACBD'});
      $('.cbMap').css({'background-color':'#B1ACBD'});

      map.addLayer(council);
      map.fitBounds(council.getBounds());        
        }

      });

        
         
$('.cbMap').click(function(){
      //event.preventDefault();
      if(map.hasLayer(CB)) {
         $(this).removeClass('selected');
         map.removeLayer(CB);
         $(this).css({'background-color':'#B1ACBD'});
        
      } else {
         map.removeLayer(councilMap);
         map.removeLayer(council);
         map.removeLayer(cbMap);
  
         map.addLayer(CB);

         $(this).css({'background-color':'#F56FFC'});
         $('.allCB').css({'background-color':'#B1ACBD'});
         $('.allCouncil').css({'background-color':'#B1ACBD'});
         $('.cDistMap').css({'background-color':'#B1ACBD'});
         map.fitBounds(CB.getBounds());        
            }    
         });
        
$('.allCouncil').click(function(){
      //event.preventDefault();
      if(map.hasLayer(councilMap)) {
         $(this).removeClass('selected');
         map.removeLayer(councilMap);
         $(this).css({'background-color':'#B1ACBD'});      

      } else {
         map.removeLayer(council);
         map.removeLayer(CB);
         map.removeLayer(cbMap);

         map.addLayer(councilMap)

         $(this).css({'background-color':'#F56FFC'});
         $('.allCB').css({'background-color':'#B1ACBD'});
         $('.cbMap').css({'background-color':'#B1ACBD'});
         $('.cDistMap').css({'background-color':'#B1ACBD'});
         map.fitBounds(council.getBounds());        
         }  
      });

$('.allCB').click(function(){
   //event.preventDefault();
      if(map.hasLayer(cbMap)) {
         $(this).removeClass('selected');
         map.removeLayer(cbMap);
         $(this).css({'background-color':'#B1ACBD'});
        
       } else {
         map.removeLayer(council);
         map.removeLayer(CB);
         map.removeLayer(councilMap);

         map.addLayer(cbMap);

         $(this).css({'background-color':'#F56FFC'});
         $('.allCouncil').css({'background-color':'#B1ACBD'});
         $('.cbMap').css({'background-color':'#B1ACBD'});
         $('.cDistMap').css({'background-color':'#B1ACBD'});
         map.fitBounds(CB.getBounds())

         }


      });
      

 $('.satellite').click(function(){

      $(this).css({'background-color':'#F56FFC'});
      map.removeLayer(mapboxTiles);
      map.addLayer(sat);  
      $('.mapColor').css({'background-color':'#B1ACBD'});
      });
      
$('.mapColor').click(function(){
      $(this).css({'background-color':'#F56FFC'});
      map.removeLayer(sat);
      map.addLayer(mapboxTiles);  
      $('.satellite').css({'background-color':'#B1ACBD'});
      });
      





  
