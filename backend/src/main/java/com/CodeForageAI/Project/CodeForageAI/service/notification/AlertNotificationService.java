package com.CodeForageAI.Project.CodeForageAI.service.notification;

import com.CodeForageAI.Project.CodeForageAI.dto.alert.AlertNotification;

public interface AlertNotificationService {

    void notify(AlertNotification notification);
}
