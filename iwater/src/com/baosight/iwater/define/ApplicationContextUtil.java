package com.baosight.iwater.define;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;
@Component
public class ApplicationContextUtil implements ApplicationContextAware {  
	  
    private static ApplicationContext context;//声明一个静态变量保存  


    public void setApplicationContext(ApplicationContext applicationContext)  
            throws BeansException {  
        this.context=applicationContext;  
    }  
  
    public  static  ApplicationContext getContext(){  
          return context;  
    }  
} 