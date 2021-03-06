/**
 *  对于加载菜单管理的逻辑处理
 *  code by diana 2017.1.16
 */
define(["util","avalon"],function (util,avalon) {
	
	var menuselect = require(['./core/javascripts/components/lightwork.menuselect']);
	var tablelist = require(['./core/javascripts/components/lightwork.table']);
	var displayRow = 10;  // 设置列表显示的默认显示的行数
	var pager = require(['./core/javascripts/components/lightwork.pager']);
	 // 查询条件接口
	var ajax={
		menu_query:'./public/iwater/config/role_query.json',
		table_query:'./system/role/list?param='+encodeURI('{"pageNo":"1","pageSize":"'+displayRow+'"}'),
		download_query:'./system/role/download',
		menu_del:'./system/role/del'
	};
	
	// 创建菜单对应的模型库
	var vm = avalon.define({
		$id:"role_query",
		menu:[],
		num:3,
		totalCount:0,
		query_item:'',    /*查询条件  默认为空  代表全查*/
		queryList:function(e){ // 查询的处理逻辑
			vm.query_item=util.get_query_list();
			// 更改当前页码，顺序不能变	      	  
	      	window.location.hash = location.hash.replace('page=' + util.getHashStr("page"), 'page=' + 1);
			vm_page.currentPage=1;
			ajax.table_query='./system/role/list?param='+encodeURI('{"pageNo":1,"pageSize":"'+displayRow+'"}');
			getGridData();  //重新初始化页面
			//alert(JSON.stringify(stk));
		},
		clearAll:function(e){  // 清空选项
			//针对特定的checkbox
			$("input[data-key='role_type']").each(function() { 
				$(this).attr("checked", false); 
			}); 
			// 对input 输入框的处理
			$("input[type='text']").val("");
		}
	});
	
	
	// 创建列表对应的模型库
	var vm_table = avalon.define({
		$id:'role_list',		
		gridZhColumns: ['主键','角色类型','角色中文名称','角色英文名称','角色代码'],
		gridEnColumns: ['ui_id','role_type','role_zhname','role_enname',"role_code"],
		isHandle:true,
		keyColumn:'ui_id',
		handleData:[{icon:'btn_re',text:'修改',key:'update'},{icon:'btn_del',text:'删除',key:'del'},{icon:'btn_lookUp',text:'浏览角色用户',key:'lookUp'}],
		gridData: [],
        updateEvent:function(stk){
        	//修改url地址实现页面的跳转
        	window.location.href="#!/role/addRole?type=upd&ui_id="+stk;
        },
        delEvent:function(stk){
//        	var flag=confirm("确定删除吗?");
//        	if(flag){
//        		data_del(stk);
//        	}
        	util.layerConfirm("确定删除吗？",function(){data_del(stk);});
    		/*util.confirm("确定删除吗?",function(result){
    		alert(result);
    		},"300px");*/
        },
        cbProxy:function(e,k,index){ 
        	avalon.log(k);
        	//获得主键
        	var stk=$("td[name='ui_id']")[index].innerHTML;  //主键
        	if($(e.target).text()=='修改'){
        		vm_table.updateEvent(stk);
        	}
        	if($(e.target).text()=='删除'){
        		vm_table.delEvent(stk);
        	}
        	if($(e.target).text()=='浏览角色用户'){
        		window.location.href="#!/role/roleUser?ui_id="+stk;
        	}
        	//ie 不兼容
        	/*if(e.toElement.innerHTML=='修改'){
        		vm_table.updateEvent(stk);
        	}
        	if(e.toElement.innerHTML=='删除'){
        		vm_table.delEvent(stk);
        	}*/
        }
	});
	
	
	//进行删除
	function data_del(ui_id){
		var stk={'ui_id':ui_id};
		util.post(ajax.menu_del,stk,function(result) {
			 //这里需要注意的是由于 post方式返回的是json字符串“” 所以要进行转换
			 var aJson=eval("("+result+")");
			 if(aJson.code=="0"){
				 util.layerMsg("删除成功");
				 getGridData();    //将表单初始化
			 }
			 else{
				 util.layerMsg(aJson.message);
			 }
		 });
	}
	
	// 创建分页所需的的模型库
	var vm_page = avalon.define({		
		$id:'role_pager',
		showPages:0,   //显示的页标  
		totalPages:0,	 //初始总页数
		currentPage:1,  //当前页数
		onPageClick:function(e,cur){
			//alert(util.getHashStr("page"));  //通过得到url上键为page的值 来得到新的页码
			//重新修改请求路径  并进行请求
			ajax.table_query='./system/role/list?param='+encodeURI('{"pageNo":"'+cur+'","pageSize":"'+displayRow+'"}');
			vm_page.currentPage=cur;
			getGridData();
		}
	});
	
	 // 从接口处获取具体的查询条件信息
    util.getJson(ajax.menu_query,{},function(result) {
          // 根据具体情况修改错误代码
          var aJson= result[0];          
          if(aJson.code == "0" ){
        	  vm.menu = aJson.data;
        	  // 更新数据后，刷新视图
        	  //avalon.scan(document.body);        	  
	       }
	       else
	    	  util.layerMsg(aJson.msg);
	 }); 
    
    
    // 从接口处获取具体的列表信息---
    function getGridData(){
    	//avalon.log(JSON.stringify());
	    util.post(ajax.table_query,vm.$model.query_item,function(result) {
	    	var aJson=eval("("+result+")");
	        if(aJson.code == "0" ){
	          //下面的代码是针对具体的分页显示情况作调整
	          if(vm_page.showPages>aJson.pageInfo.totalPage){  //当实际页数少于当前设置页数
	        	vm_page.showPages=aJson.pageInfo.totalPage;
	          }
	          if(vm_page.showPages<aJson.pageInfo.totalPage){  //当实际页数多于当前页数时
	        	  if(aJson.pageInfo.totalPage<=5){             //实际页数小于等于5
	        		  vm_page.showPages=aJson.pageInfo.totalPage;
	        	  }
	        	  else{							               //实际页数大于5
	        		  vm_page.showPages=5;
	        	  }
	          }
	          vm_page.totalPages=aJson.pageInfo.totalPage;   //修改页面显示的总页数
	          vm.totalCount=aJson.pageInfo.totalCount;  	 //修改页面显示的总记录数
	          
	          for(var i=0;i<aJson.data.length;i++){  //对数据做简单处理  应该来源于数据字典
	        	  var type=aJson.data[i].role_type;
	        	  if(type=='role_type_001'){
	        		  aJson.data[i].role_type='浏览类';
	        	  }
	        	  if(type=='role_type_002'){
	        		  aJson.data[i].role_type='填报类';
	        	  }
	        	  if(type=='role_type_003'){
	        		  aJson.data[i].role_type='操作类';
	        	  }
	        	  if(type=='role_type_004'){
	        		  aJson.data[i].role_type='管理类';
	        	  }
	          }
	          
	      	  vm_table.gridData = aJson.data;
	      	  // 更新数据后，刷新视图
	      	  //avalon.scan(document.body);        	  
		    }
		    else
		      util.layerMsg(aJson.message);
		 });
    }
    
    //初始化显示页面
    getGridData();
});