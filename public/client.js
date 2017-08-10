var r = new Random();

const min_date = new moment('2017-07-01');
const max_date = new moment();
const dfmt = 'YYYY-MM-DD';

var socket;

$(function() {
  
  console.log('viirs between '+ min_date.format(dfmt) + ' and ' + max_date.format(dfmt));
  
  // set the range for the slider & the date range
  //<input id="start" type="range" multiple min="0" step="1" max="10" data-values="1 9">
  var duration = max_date.diff(min_date, 'days');
  $('.slider input[type="range"]')
    .attr('max', duration+1)
    .attr('data-values', '1 '+duration);
  
  // init the slider with the dates & #days
  $('.slider input[type="range"]').on('input', _slider);
  $('.slider input#start').val(0);
  $('.slider input#end').val(duration+1);
  
  // add some background imagery
  for (var i=0; i<10; i++) {
    $.get({
      url: '/svg',
      data: {type: 'owl'},
      success: function(data) {
        inject_svg(data);
      }
    });
  }
  
  // set up the socket for the viirs data
  socket = io();
  
  socket.on('imagery', function(data) {
    $('#viirs').attr('src', data.datauri);
    
    $('.info').html('<p>The current time is '+data.time+'</p>');
  });
  
  $('#viirs').on('load', function(e) {
    e.preventDefault();
    
    console.log('loading viirs');
    // linear & forwards
    $('path#border').animate({
      strokeDashoffset: 0,
      opacity: 0
    },{
      duration: 5000,
      complete: function() {
        // reset the svg border
        $(this).css({
          strokeDasharray: 4002,
          strokeDashoffset: 4002,
          opacity: 1
        })
      }
    });
  });
  
  // and to add additional background imagery, ie owls
  $('#addOwl').on('click', (event) => {
    event.preventDefault();
    $.get({
      url: '/svg',
      success: function(data) {
        console.log('adding new svg');
        
        inject_svg(data);
      }
    });
  });
  
  
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

function _slider(e) {
  // sliders as integer == days
  // update labels with dates
  // & make sure they don't slide past each other
  e.preventDefault();
  
  var $this = e.currentTarget;
  
  var start_slider = $('.slider #start');
  var end_slider = $('.slider #end'); 
  
  var s = parseInt(start_slider.val());
  var e = parseInt(end_slider.val());
  
  if (e <= s || s >= e) {
    var f = $($this).attr('id')==='start' ? Math.min : Math.max;
    
    $($this).val(f(e, s));
    
    e = $($this).attr('id')==='end' ? f(s, e) : e;
    s = $($this).attr('id')==='start' ? f(s, e) : s;
  }
  
  var max_int = parseInt($('.slider #end').attr('max'));

  let x = min_date.clone().add(s, 'days');
  let y = max_date.clone().subtract(max_int - e, 'days');
  $('.slider-label').text(
    x.format(dfmt) +
    ' to ' +
    y.format(dfmt)
  );
  
  socket.emit('update', {mindate: x.format(dfmt), maxdate: y.format(dfmt)});
}

