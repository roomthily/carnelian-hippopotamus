var r = new Random();

const min_date = new moment('2017-07-01');
const max_date = new moment();

$(function() {
  
  console.log('viirs between '+ min_date.format('YYYY-MM-DD') + ' and ' + max_date.format('YYYY-MM-DD'));
  
  // add some background imagery
  for (var i=0; i<10; i++) {
    $.get({
      url: '/svg',
      data: {type: 'owl'},
      success: function(data) {
        console.log('adding svg #'+ (i+1));
        
        inject_svg(data);
      }
    });
  }
  
  // set up the socket for the viirs data
  var socket = io();
  
  socket.on('imagery', function(data) {
    console.log('the current time is:', data.time);
    
    $('#viirs').attr('src', data.datauri);
    
    $('.info').html('<p>The current time is '+data.time+'</p>');
  });
  
  // and to add additional background imagery, ie owls
  $('#addOwl').on('click', (event) => {
    $.get({
      url: '/svg',
      success: function(data) {
        console.log('adding new svg');
        
        inject_svg(data);
      }
    });
  });
  
  // init the slider with the dates & #days
  

});

function inject_svg(data) {
  var id = 'svg_'+ r.string(5, 'abcdefghijklmnopqrstuvwxyz0123456789');

  // because jquery can't handle the svg
  var n = document.importNode(data.documentElement,true);
  n.setAttribute('id', id);

  // inject some styles because we want kinda random blobbos

  $('.svgs').append(n);
  $('body').append('<style>#'+id+' {position:absolute;z-index:1; top: '+r.integer(30, 90)+'%; left: '+r.integer(0, 90)+'%;} #'+id+' svg { transform: rotate('+r.integer(0,359)+'deg) scale('+r.real(0.5, 2.5)+');} #'+id+' polyline {stroke: #fff;stroke-width:'+r.integer(1, 5)+';}</style>');
}

function _slider() {
  // sliders as integer == days
  // update labels with dates
  // & make sure they don't slide past each other
  
  var start_slider = $('.slider #start');
  var end_slider = $('.slider #end');
  
  var s = parseInt(start_slider.value);
  var e = parseInt(end_slider.value);
  
  
  $('.slider-label').text('');
  
}

