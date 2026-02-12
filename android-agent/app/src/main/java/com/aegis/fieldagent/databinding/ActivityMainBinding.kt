package com.aegis.fieldagent.databinding

import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.aegis.fieldagent.R

class ActivityMainBinding private constructor(
    val root: ConstraintLayout,
    val tvTitle: TextView,
    val tvServerLabel: TextView,
    val etServerUrl: EditText,
    val btnSaveServer: Button,
    val layoutRegistration: LinearLayout,
    val etDeviceName: EditText,
    val btnRegister: Button,
    val progressBar: ProgressBar,
    val layoutControl: LinearLayout,
    val tvDeviceId: TextView,
    val tvDeviceName: TextView,
    val tvStatus: TextView,
    val btnStartService: Button,
    val btnStopService: Button,
    val btnClearData: Button
) {
    companion object {
        fun inflate(inflater: LayoutInflater): ActivityMainBinding {
            val root = inflater.inflate(R.layout.activity_main, null) as ConstraintLayout
            return bind(root)
        }

        fun bind(rootView: ConstraintLayout): ActivityMainBinding {
            val tvTitle = rootView.findViewById<TextView>(R.id.tvTitle)
            val tvServerLabel = rootView.findViewById<TextView>(R.id.tvServerLabel)
            val etServerUrl = rootView.findViewById<EditText>(R.id.etServerUrl)
            val btnSaveServer = rootView.findViewById<Button>(R.id.btnSaveServer)
            val layoutRegistration = rootView.findViewById<LinearLayout>(R.id.layoutRegistration)
            val etDeviceName = rootView.findViewById<EditText>(R.id.etDeviceName)
            val btnRegister = rootView.findViewById<Button>(R.id.btnRegister)
            val progressBar = rootView.findViewById<ProgressBar>(R.id.progressBar)
            val layoutControl = rootView.findViewById<LinearLayout>(R.id.layoutControl)
            val tvDeviceId = rootView.findViewById<TextView>(R.id.tvDeviceId)
            val tvDeviceName = rootView.findViewById<TextView>(R.id.tvDeviceName)
            val tvStatus = rootView.findViewById<TextView>(R.id.tvStatus)
            val btnStartService = rootView.findViewById<Button>(R.id.btnStartService)
            val btnStopService = rootView.findViewById<Button>(R.id.btnStopService)
            val btnClearData = rootView.findViewById<Button>(R.id.btnClearData)

            return ActivityMainBinding(
                root,
                tvTitle,
                tvServerLabel,
                etServerUrl,
                btnSaveServer,
                layoutRegistration,
                etDeviceName,
                btnRegister,
                progressBar,
                layoutControl,
                tvDeviceId,
                tvDeviceName,
                tvStatus,
                btnStartService,
                btnStopService,
                btnClearData
            )
        }
    }
}
