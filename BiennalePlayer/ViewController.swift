//
//  ViewController.swift
//  WKWebViewLocal
//
//  Created by Gary Newby on 2/17/18.
//  Copyright © 2018 Mellowmuse. All rights reserved.
//

import UIKit
import WebKit

// SECOND SCREEN
var secondWindow : UIWindow?
var secondScreenView : UIView?
var externalLabel = UILabel()

// Add load local file method
class LocalWebView : WKWebView {

    init(frame: CGRect) {
        let configuration = WKWebViewConfiguration()
        let controller = WKUserContentController()
        configuration.userContentController = controller;
        super.init(frame: frame, configuration: configuration)
        
        self.allowsBackForwardNavigationGestures = false
    }
    
    required convenience init?(coder: NSCoder) {
        self.init(frame: CGRect.zero)
    }
    
    func loadFile(name: String) {
        let fileManager = FileManager.default
        do {
            let documentDirectory = try fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor:nil, create:false)
            let baseURL = documentDirectory
            let fileURL = baseURL.appendingPathComponent(name)
            print(baseURL)
            self.loadFileURL(fileURL, allowingReadAccessTo: baseURL)
        } catch {
            print(error)
        }
    }
    
    func executeJS(js: String) {
        self.evaluateJavaScript(js) { (result: Any?, error: Error?) in
            if let error = error {
                print("evaluateJavaScript error: \(error.localizedDescription)")
            } else {
                print("evaluateJavaScript result: \(result ?? "")")
            }
        }
    }
    
    func sendMessage(message: String) {
        self.executeJS(js: "onMessage('"+message+"');")
    }
}

// Wrap the LocalWebView webview to allow IB use
class MyWebView : LocalWebView {
    required init?(coder: NSCoder) {
        super.init(frame: CGRect.zero)
    }
}

class ViewController: UIViewController {
    @IBOutlet weak var telecoWV: MyWebView!
    var playerWV: LocalWebView!
    var destPath: String!
    var sourcePath: String!
    var docURL: URL!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // COPY Web_assets to /Document/www
        let filemgr = FileManager.default
        docURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        destPath = docURL.path+"/zzz/"
        sourcePath = Bundle.main.resourceURL!.appendingPathComponent("Web_Assets").path
        do {
            try filemgr.removeItem(atPath: destPath)
        } catch {
            print("Error: \(error.localizedDescription)")
        }
        do {
            try filemgr.copyItem(atPath: sourcePath, toPath: destPath)
        } catch {
            print("Error: \(error.localizedDescription)")
        }

        // WEBVIEW 1
        telecoWV.navigationDelegate = self
        telecoWV.configuration.userContentController.add(self, name: "teleco")
        telecoWV.loadFile(name: "zzz/page_teleco.html")
        
        // Attach second screen
        setupScreen()
        registerForScreenNotifications()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    @objc func setupScreen(){
        if UIScreen.screens.count > 1{
            
            //find the second screen
            let secondScreen = UIScreen.screens[1]
            
            //set up a window for the screen using the screens pixel dimensions
            secondWindow = UIWindow(frame: secondScreen.bounds)
            //windows require a root view controller
            //let viewcontroller = UIViewController()
            secondWindow?.rootViewController = self
            secondWindow?.screen = secondScreen
            secondWindow?.isHidden = false
            
            // WEBVIEW 2
            self.playerWV = LocalWebView(frame: secondWindow!.frame)
            secondWindow!.addSubview(self.playerWV)
            playerWV.navigationDelegate = self
            playerWV.configuration.userContentController.add(self, name: "player")
            playerWV.loadFile(name: "zzz/page_player.html")
        }
    }
    
    // Detect second screen attachment
    func registerForScreenNotifications(){
        let notificationCentre = NotificationCenter.default
        notificationCentre.addObserver(self, selector: #selector(ViewController.setupScreen), name: NSNotification.Name.UIScreenDidConnect, object: nil)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        UIApplication.shared.isStatusBarHidden = true
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        UIApplication.shared.isStatusBarHidden = false
    }
}

extension ViewController : WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        
        let source = message.name
        let text = message.body as! String
        
        if source == "teleco" {
            if (playerWV != nil) {
                playerWV.sendMessage(message: text)
            }
        }
        else if source == "player" {
            telecoWV.sendMessage(message: text)
        }
    }
}

extension ViewController : WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("didFinish navigation:");
    }
    func webView2(_ webView2: WKWebView, didFinish navigation: WKNavigation!) {
        print("didFinish navigation:");
    }
}




