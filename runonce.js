app = {
  init: function(){ 
    $this = this;
  },
  home: function(){ },
  get_file_instance: function(){
    var reporter_email = $('.reporter_email').val();
    var reporter_fullname = $('.reporter_fullname').val();
    var reporter_title = $('.reporter_title').val();
    var car_brand = $('.car_brand').val();
    var car_series = $('.car_series').val();
    var car_model = $('.car_model').val() == '' ? $('.car_model_select').val() : $('.car_model').val();
    var car_price = $('.car_price').val();
    var car_vin = $('.car_vin').val();
    var license_plate = $('.license_plate').val();
    var stolen_items = $('.stolen_items').val();
    var broken_items = $('.broken_items').val();
    var loss_costs = $('.loss_costs').val();
    var happen_date = $('.happen_date').val();
    var happen_time = $('.happen_time').val();
  //var happen_place = {};
    var country = $('.country').val();
    var province = $('.province').val();
    var city = $('.city').val();
    var district = $('.district').val();
    var street = $('.street').val();
    var number = $('.number').val();
    var other = $('.other').val();
    var report_date = $('.report_date').val();
    var report_time = $('.report_time').val();
    var report_to = $('.report_to').val();
    var revisited = $('input[name=revisited]:checked').val() == 'true' ? true : false;
    var resolved = $('input[name=resolved]:checked').val() == 'true' ? true : false;
    var insurance_covered = $('input[name=insurance_covered]:checked').val() == 'true' ? true : false;
    var insurance_brand = $('.insurance_brand').val();
    var compensated = $('input[name=compensated]:checked').val() == 'true' ? true : false;
    var compensated_percent = $('.compensated_percent').val();
    var reporter_tel = $('.reporter_tel').val();
    var reporter_mobile = $('.reporter_mobile').val();
    var memo = $('.memo').val();
    
    var file_instance = {
      reporter_email: reporter_email,
      reporter_fullname: reporter_fullname,
      reporter_title: reporter_title,
      car_brand: car_brand,
      car_series: car_series,
      car_model: car_model,
      car_price: car_price,
      car_vin: car_vin,
      license_plate: license_plate,
      stolen_items: stolen_items,
      broken_items: broken_items,
      loss_costs: loss_costs,
      happen_date: happen_date,
      happen_time: happen_time,
      happen_place: { 
        country: country, 
        province: province, 
        city: city,
        district: district,
        street: street,
        number: number,
        other: other
      },
      report_date: report_date,
      report_time: report_time,
      report_to: report_to,
      revisited: revisited,
      resolved: resolved,
      insurance_covered: insurance_covered,
      insurance_brand: insurance_brand,
      compensated: compensated,
      compensated_percent: compensated_percent,
      reporter_tel: reporter_tel,
      reporter_mobile: reporter_mobile,
      memo: memo
    }

    return file_instance;
  },
  submit_report: function(){
    if( $('.user-credit').is(':checked') == false ){
      alert('您没有保证所有填写的内容都是真实有效的，\n所以不能提交。');
      return
    }
    var instance = $this.get_file_instance();
    
    var data = {file: JSON.stringify(instance), test:1};
    
    $.ajax('/save_report', {type:'POST', dataType:'json', data:data})
    .done(function( file ){
      alert( '存档成功，非常感谢您的时间与参与！' );
      window.location.href = "/";
    })
  },
  report: function(){
    //init datepicker
    $('.happen_date, .report_date').datepicker();
    
    //init time range
    var time_html = '';
    for(var i=0; i<24; i++){
      time_html += '<option>' + i + ':00' + '</option><option>' + i + ':30' + '</option>';
    }
    $(time_html).appendTo( $('.happen_time, .report_time') );
    
    //init address picker
    $('.province').html( $this.get_addr_html(1) ).change(function(){
      var key = $(this).find('option:selected').attr('key');
      $('.city').html( $this.get_addr_html(key) ).change(function(){
        var key = $(this).find('option:selected').attr('key');
        $('.district').html( $this.get_addr_html(key) );
      }).trigger('change');
    }).trigger('change');

    //init brand picker
    var car_brand_default = '<option>请选择品牌</option>';
    $('.car_brand').html( car_brand_default + $this.get_car_html( fct[0] ) ).change(function(){
      var car_series_default = '<option>请选择系列</option>';
      var data = br[$(this).find('option:selected').attr('key')];
      $('.car_series').html( car_series_default + $this.get_car_html( data ) ).change(function(){
        var car_model_default = '<option>请选择具体车型</option>';
        var model_year = spec_year_name[$(this).find('option:selected').attr('key')];
        $('.car_model_select').html( car_model_default + $this.get_car_model( model_year ) );
      })
    })

    //submit report
    $('#submit-report').click(function(){ $this.submit_report(); })
  },
  get_car_model: function( model_year ){
    var html = '';
    $($.map(model_year.split(','), function(el,i){ if(i%2==0)return el })).each(function(){
      var foreign = this.toString();
      $(spl[foreign].split(',')).each(function(i){
        if(i%2!=0)html += '<option>' + this.toString() + '</option>';
      })
    })
    return html;
  },
  get_car_html: function( data ){
    var html = '';
    $( data.replace(/(\d),/g, '$1|').split(',') ).each(function(){
      var text = this.toString().split('|');
      var key = text[0];
      var val = text[1];
      html += '<option key="' + key + '">' + val + '</option>';
    })
    return html;
  },
  get_addr_html: function( foreign ){
    var html = '';
    for(var prop in GEO_DATA){
      var data = GEO_DATA[prop];
      var part = data[0];
      var key = data[1];
      if( key == foreign ){
        html += '<option key="' + prop + '">' + part + '</option>';
      }
    }
    return html;
  },
  to_zh: function( value ){
    var character = value.split("\\u");
    var native = character[0];
    for(var i = 1; i < character.length; i++ ){
      var code = character[i];
      native += String.fromCharCode( parseInt( "0x" + code.substring( 0, 4 ) ) );
      if( code.length > 4 ){
        native += code.substring( 4, code.length );
      }
    };
    return native;
  }
}

$(function(){
  var default_action = 'home';
  var url = window.location.href;
  var pattern = /^.*\/([^\/]+)$/;
  var action = pattern.test(url) ? url.replace(pattern, '$1') : default_action;
  app['init']();
  app[action]();
})
