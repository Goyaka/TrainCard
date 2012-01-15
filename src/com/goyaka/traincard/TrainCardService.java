package com.goyaka.traincard;

import java.util.Calendar;
import java.util.Timer;
import java.util.TimerTask;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

public class TrainCardService extends Service {

	private Long counter = 0L; 
	private Timer timer = new Timer();

	private NotificationManager nm;
	private final Calendar time = Calendar.getInstance();

	@Override
	public IBinder onBind(Intent arg0) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public void onCreate() {
		super.onCreate();
		nm = (NotificationManager)getSystemService(NOTIFICATION_SERVICE);
		Toast.makeText(this,"Service created at " + time.getTime(), Toast.LENGTH_LONG).show();
		showNotification();
		incrementCounter();

	}
	
	@Override
	public void onDestroy() {
		super.onDestroy();
		shutdownCounter();
        nm.cancel(R.string.service_started);
		Toast.makeText(this, "Service destroyed at " + time.getTime(), Toast.LENGTH_LONG).show();
	}
	 

    private void showNotification() {
		CharSequence text = getText(R.string.service_started);
		Notification notification = new Notification(R.drawable.logo, text, System.currentTimeMillis()); 
		PendingIntent contentIntent = PendingIntent.getActivity(this, 0, new Intent(this, TrainCardActivity.class), 0);
		notification.setLatestEventInfo(this, getText(R.string.service_label),text, contentIntent);
		nm.notify(R.string.service_started, notification);
    } 
    
    
    private void incrementCounter() {
    	timer.scheduleAtFixedRate(new TimerTask(){ 
    		public void run() {
    			counter++;
    			Log.v("PHOTOUPLOAD", "Listening for upload" + counter);
    			//See these logs in LogCat.
    			//Listen for camera event, and if photo taken, upload it.
    		}
    	}, 0, 5000L);
    }

    
    private void shutdownCounter() {
    	if (timer != null) {
    		timer.cancel();
    	}
    }

    
}
