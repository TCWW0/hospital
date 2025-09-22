package com.medicalunion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

/**
 * Medical Union Management System Application
 * 
 * 医联体管理系统主启动类
 * 基于Spring Boot构建的医联体协同管理平台
 */
@SpringBootApplication
@MapperScan("com.medicalunion.**.mapper")
public class MedicalUnionApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalUnionApplication.class, args);
    }
}