import React from 'react';


export const AddNotificationMethod = () => {
        return (<div id="notificationMethod">
        <select>
            <option value="Text" id="text">Text</option>
            <option value="Email" id="email">Email</option>
        </select>
        <input type="text" name="notification" id="notification" />
              <br/>
    </div>)   
    };

    
