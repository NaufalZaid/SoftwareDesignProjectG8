package com.kallavaninc.backend.GeneralFeatures.Observer;

import com.kallavaninc.backend.Entities.Order.Order;

public interface Observer {
    void update(Order order, String eventType);
}
