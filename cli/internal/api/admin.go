package api

import (
	"context"
	"fmt"
	"github.com/ente-io/cli/internal/api/models"
	"time"
)

func (c *Client) GetUserIdFromEmail(ctx context.Context, email string) (*models.UserDetails, error) {
	var res models.UserDetails
	r, err := c.restClient.R().
		SetContext(ctx).
		SetResult(&res).
		SetQueryParam("email", email).
		Get("/admin/user/")
	if err != nil {
		return nil, err
	}
	if r.IsError() {
		return nil, &ApiError{
			StatusCode: r.StatusCode(),
			Message:    r.String(),
		}
	}
	return &res, nil
}
func (c *Client) UpdateFreePlanSub(ctx context.Context, userDetails *models.UserDetails, storageInBytes int64, expiryTimeInMicro int64) error {
	var res interface{}
	if userDetails.Subscription.ProductID != "free" {
		return fmt.Errorf("user is not on free plan")
	}
	payload := map[string]interface{}{
		"userID":          userDetails.User.ID,
		"expiryTime":      expiryTimeInMicro,
		"transactionID":   fmt.Sprintf("cli-on-%d", time.Now().Unix()),
		"productID":       "free",
		"paymentProvider": "",
		"storage":         storageInBytes,
	}
	r, err := c.restClient.R().
		SetContext(ctx).
		SetResult(&res).
		SetBody(payload).
		Put("/admin/user/subscription")
	if err != nil {
		return err
	}
	if r.IsError() {
		return &ApiError{
			StatusCode: r.StatusCode(),
			Message:    r.String(),
		}
	}
	return nil

}
