package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

// StringList is a []string persisted as a jsonb column (used for amenities, tags).
// Small custom type to avoid pulling in gorm.io/datatypes for two fields.
type StringList []string

func (s StringList) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	return string(b), err
}

func (s *StringList) Scan(v any) error {
	if v == nil {
		*s = nil
		return nil
	}
	var b []byte
	switch t := v.(type) {
	case []byte:
		b = t
	case string:
		b = []byte(t)
	default:
		return fmt.Errorf("StringList: unsupported scan type %T", v)
	}
	if len(b) == 0 {
		*s = nil
		return nil
	}
	return json.Unmarshal(b, s)
}

// GormDataType tells GORM to use jsonb for this type on Postgres.
func (StringList) GormDataType() string { return "jsonb" }
