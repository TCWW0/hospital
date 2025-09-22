package com.medicalunion.tools;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;

public class DbInfo {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/medical_union?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC";
        String user = "root";
        String pass = "Tcww3498";

        System.out.println("Connecting to: " + url);
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            DatabaseMetaData md = conn.getMetaData();
            System.out.println("Driver: " + md.getDriverName() + " " + md.getDriverVersion());
            System.out.println("Product: " + md.getDatabaseProductName() + " " + md.getDatabaseProductVersion());
            System.out.println("URL: " + md.getURL());
        }
    }
}
