package handlers

import (
	"net/http"

	"github.com/Informasjonsforvaltning/fdk-harvest-admin/service"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

var GetAllHandler = func() func(c *gin.Context) {
	service := service.InitService()
	return func(c *gin.Context) {
		logrus.Info("Getting all data sources")

		dataSources, err := service.GetAllDataSources(c.Request.Context())
		if err != nil {
			logrus.Error("Get all data sources failed ", err)
		}

		c.JSON(http.StatusOK, dataSources)
	}
}

var GetDataSourceHandler = func() func(c *gin.Context) {
	service := service.InitService()
	return func(c *gin.Context) {
		id := c.Param("id")
		logrus.Infof("Getting data source with id %s", id)

		dataSource, err := service.GetDataSource(c.Request.Context(), id)
		if err != nil {
			logrus.Errorf("Get data sources with id %s failed ", id, err)
		}

		if dataSource == nil {
			c.Status(http.StatusNotFound)
		} else {
			c.JSON(http.StatusOK, dataSource)
		}
	}
}

var DeleteDataSourceHandler = func() func(c *gin.Context) {
	service := service.InitService()
	return func(c *gin.Context) {
		id := c.Param("id")
		logrus.Infof("Deleting data source with id %s", id)

		err := service.DeleteDataSource(c.Request.Context(), id)

		if err == mongo.ErrNoDocuments {
			c.Status(http.StatusNotFound)
		} else if err != nil {
			logrus.Errorf("Delete data source with id %s failed. ", id, err)
			c.Status(http.StatusInternalServerError)
		} else {
			c.Status(http.StatusOK)
		}
	}
}
