package model

type DataSource struct {
	ID                string             `json:"id" bson:"id"`
	DataSourceType    DataSourceTypeEnum `json:"dataSourceType" bson:"dataSourceType"`
	DataType          DataTypeEnum       `json:"dataType" bson:"dataType"`
	URL               string             `json:"url" bson:"url"`
	AcceptHeaderValue string             `json:"acceptHeaderValue" bson:"acceptHeaderValue"`
	PublisherID       string             `json:"publisherId" bson:"publisherId"`
	Description       string             `json:"description" bson:"description"`
	AuthHeader        *AuthHeader        `json:"authHeader" bson:"authHeader"`
}

func (dataSource DataSource) Validate() error {
	err := dataSource.DataSourceType.Validate()
	if err != nil {
		return err
	}
	return dataSource.DataType.Validate()
}
