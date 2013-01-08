  $fastloop = function(array, process, caller){
    var iterations = Math.floor(array.length / 8); 
    var leftover = array.length % 8; 
    var i = 0;  
 
    if (leftover > 0){     
      do {         
        process(array[i++], i-1, caller);
      } while (--leftover > 0); 
    }  
    do {     
	  process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
      process(array[i++], i-1, caller);
    } while (--iterations > 0);
  }  

  sql = function(field){
    var query = {}
    query.field = field.replace(/\s/g,''); 
    query.table = {};
    query.condition = '';
    query.result = [];
    
    query.from = function(table){
      query.table = table; 
      if(query.field != '*'){
        var statement = [];
        $(query.field.split(',')).each(function(i,f){ statement.push( f + ':' + 'el[\'' + f + '\']') });
        statement = '$.map(query.table, function(el, index){ return {' + statement.join(',') + '}})';
        query.table = eval(statement);
      }
      query.result = query.table;
      return query;
    }
    query.where = function(condition){
      condition = condition.replace(/(['"])\sOR\s?/g, '$1||');
      condition = condition.replace(/(['"])\sAND\s?/g, '$1&&');
      //NOT LIKE statement
      condition = condition.replace(/([a-zA-Z_]+)(\sNOT\sLIKE\s)("%)([^%]*)(%")/g, 'el[\'$1\'].toString().indexOf(\'$4\') == -1');
      //LIKE statement
      condition = condition.replace(/([a-zA-Z_]+)(\sLIKE\s)("%)([^%]*)(%")/g, 'el[\'$1\'].toString().indexOf(\'$4\') > -1');
      condition = condition.replace(/(\s|(".*?"))/g, '$2');
      condition = condition.replace(/(\b[a-zA-Z_]+\b)([<>=!]{1,2})/g, 'el[\'$1\']$2');
      
      
      condition = condition == '' ? 'true' : condition;
      query.condition = condition;
      
      var result = [];
      var lp = function(el){ if(!el){return}; if( eval(query.condition) == true ){ result.push(el) } }
      $fastloop(query.table, lp);
      
      query.table = result;
      query.result = query.table;
      return query;
    }
    query.orderby = function(condition){
      //multiple fields sorting is not supported this time
      var condition = condition.replace(/\s+/g, ' ');
          condition = condition.split(',')[0];
          condition = condition.split(' ');
      var field = condition[0];
      var order = condition[1].toUpperCase();
      
      if(order == 'DESC'){
        query.table = $qsort(query.table, field).reverse();
      }else if(order == 'ASC'){
        query.table = $qsort(query.table, field);
      }
      query.result = query.table;
      return query;
    }
    return query;
  }
  
  select = function(field){
    return sql(field);
  }

  isValidJQL = function(jql){
    return /select\('\*'\)\.from\(\$?\w+\)(?:\.where\(\'[\$a-zA-Z0-9_=%\s\(\)"]*\'\))?(?:\.orderby\(\'[a-zA-Z0-9_\s]*\'\))?;?$/i.test(jql);
  },
  
  $qsort_process = function(arr, i, params){
    var pivot = params.pivot;
    var key = params.key;
    var left = params.left;
    var right = params.right;
    if(!arr)return
    if (arr[key] < pivot[key]) {
      left.push(arr);
    } else {
      right.push(arr);
    }
  }
  $qsort = function(arr, key){
    if (arr.length <= 1) { return arr; }
    var pivotIndex = Math.floor(arr.length / 2);
    var pivot = arr.splice(pivotIndex, 1)[0];
    var left = [];
    var right = [];
    $fastloop(arr, $qsort_process, {key:key, pivot:pivot, left:left, right:right});
    return $qsort(left, key).concat(pivot, $qsort(right, key));
  }

  $validate_number = function(input, evt, callback){
    var input = $(input);
    var val = input.val();
    var key = evt.keyCode;
    if( key == 16 ){
      input.attr('shifting', 'true');
      evt.preventDefault();
      var unshift = function(evt){
        if(evt.keyCode == 16){
          $(this).attr('shifting', 'false').unbind('keyup', unshift);
        }
      }
      input.bind('keyup', unshift);
    }else{
      if( key == 37 || key == 39 || key == 46 || key == 8 || key == 9 || ( key >= 96 && key <= 105 ) ){

      }else if( /\d/.test(String.fromCharCode(key)) == true ){
        if(input.attr('shifting') == 'true'){
          evt.preventDefault();
        }
      }else{
        evt.preventDefault();
      }
    }
    if(typeof callback != 'undefined'){
      var keyup = function(){ callback(); input.unbind('keyup', keyup); }
      input.bind('keyup', keyup);
    }
  }
