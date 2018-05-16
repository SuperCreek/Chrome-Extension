angular.module('myApp.service',[])
.provider('Weather',function(){
	var apiKey = "";
	this.setApiKey = function(key){
		if(key){
			this.apiKey = key
		}
	}
	
	this.getUrl = function(type,ext){
		
		return "http://api.wunderground.com/api/"+this.apiKey+'/'
			   +type+'/q/'+ext+'.json'
	}
	
	this.$get = function($q,$http){
		var self = this;
		return {
			//服务对象
			getWeatherForecast : function(city){
				var d = $q.defer();
				$http({
					method:'GET',
					url:self.getUrl("forecast",city),
					cache:true
				}).success(function(data){
					//Wunderground API返回
					//嵌套在forecast.simpleforecast属性内的forecasts对象
					d.resolve(data.forecast.simpleforecast);
				}).error(function(err){
					d.reject(err);
				})
				return d.promise;
			},
			getCityList : function(query){
				var d = $q.defer();
				$http.get('region.json').success(function(data){
					d.resolve(data);
				}).error(function(err){
					d.reject(err)
				})
				return d.promise;
			},
			
		}
	}
})
.factory('UserService',function(){
	var defaults = {
		location : "autoip"
	}
	var service = {
		user:{},
		save:function(){
			//设置一个key为presenty的sessionStorage
			sessionStorage.presenty = angular.toJson(service.user);
		},
		restore:function(){
			//从sessionStorage中获取配置
			service.user = angular.fromJson(sessionStorage.presenty)||defaults;
			return service.user;
		}
	}
	// 立即调用它，从session storage中回复配置
	// 因此这里的用户数据是立即可用的
	service.restore();
	return service;
})
angular.module('myApp',['ngRoute','myApp.service'])
.config(function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl:'templates/home.html',
		controller:'MainController'
	})
	.when('/settings',{
		templateUrl:'templates/settings.html',
		controller:'SettingController'	
	})
	.otherwise({
		redirectTo:'/'
	})
})
.config(function(WeatherProvider){
	WeatherProvider.setApiKey('53f251450a49fe3b')
})
.controller('MainController',function($scope,$timeout,Weather,UserService){
	//构建date对象
	$scope.date = {}
	//更新函数
	var updateTime = function(){
		$scope.date.raw = new Date()
		$timeout(updateTime,1000)
	}
	//启动更新函数
	updateTime()
	
	$scope.weather = {};
	$scope.user = UserService.user
	Weather.getWeatherForecast($scope.user.location)
	.then(function(data){
        angular.forEach(data.forecastday,function(val){

            switch (val.date.weekday) {
                case "Monday":
                    val.date.cnWeekday = "星期一"
                    break;
                case "Tuesday":
                    val.date.cnWeekday = "星期二"
                    break;
                case "Wednesday":
                    val.date.cnWeekday = "星期三"
                    break;
                case "Thursday":
                    val.date.cnWeekday = "星期四"
                    break;
                case "Friday":
                    val.date.cnWeekday = "星期五"
                    break;
                case "Saturday":
                    val.date.cnWeekday = "星期六"
                    break;
                default:
                    val.date.cnWeekday = "星期日"
                    break;
            }
        })
        $scope.weather.forcast = data;
        
        
	})

})
.controller('SettingController',function($scope,UserService,Weather){
	//这里是控制器定义
	$scope.user = UserService.user;
	$scope.save = function(){
		UserService.save()
	}
	Weather.getCityList().then(function(data){
		$scope.cityList = data
	})
})

