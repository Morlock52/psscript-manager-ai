#!/usr/bin/env python3
"""
Simple AI Service for PSScript Manager Testing
No external dependencies except standard library
"""

import json
import logging
import os
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

# Setup logging
logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(logs_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(logs_dir, "simple_ai.log"))
    ]
)
logger = logging.getLogger(__name__)

class AIServiceHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        logger.info(f"{self.address_string()} - {format % args}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_json_response({
                "status": "healthy", 
                "message": "PSScript AI Service is running",
                "timestamp": time.time()
            })
        elif parsed_path.path == '/models':
            self.send_json_response({
                "models": [
                    {
                        "id": "gpt-4",
                        "name": "GPT-4",
                        "description": "Advanced model for script analysis",
                        "capabilities": ["security-analysis", "performance-optimization"]
                    }
                ]
            })
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            parsed_path = urlparse(self.path)
            
            if parsed_path.path == '/analyze':
                self.handle_analyze(post_data)
            else:
                self.send_error(404, "Endpoint not found")
                
        except Exception as e:
            logger.error(f"Error handling POST request: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_analyze(self, post_data):
        """Handle script analysis requests"""
        try:
            # Parse JSON request
            request_data = json.loads(post_data.decode('utf-8'))
            script_content = request_data.get('script_content', '')
            script_id = request_data.get('script_id')
            script_name = request_data.get('script_name', 'unnamed')
            
            logger.info(f"Analyzing script: {script_name} (ID: {script_id})")
            
            # Analyze script content
            analysis = self.analyze_script_content(script_content, script_id, script_name)
            
            # Add logging for successful analysis
            logger.info(f"Analysis completed for script {script_name}: security_score={analysis['security_score']}, quality_score={analysis['code_quality_score']}")
            
            self.send_json_response(analysis)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            self.send_error(400, "Invalid JSON in request body")
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            self.send_error(500, f"Analysis failed: {str(e)}")
    
    def analyze_script_content(self, script_content, script_id, script_name):
        """Analyze PowerShell script content and return detailed analysis"""
        
        # Basic content analysis
        has_parameters = bool(re.search(r'param\s*\(', script_content, re.IGNORECASE))
        has_functions = bool(re.search(r'function\s+\w+', script_content, re.IGNORECASE))
        has_error_handling = bool(re.search(r'try\s*{|catch\s*{', script_content, re.IGNORECASE))
        has_loops = bool(re.search(r'foreach|for\s+\(|while\s+\(', script_content, re.IGNORECASE))
        has_conditionals = bool(re.search(r'if\s+\(|else\s*{', script_content, re.IGNORECASE))
        
        # Calculate scores based on content
        security_score = 8.5 if has_error_handling else 6.0
        if "Test-Path" in script_content:
            security_score += 0.5
        if "Write-Error" in script_content:
            security_score += 0.5
            
        code_quality_score = 7.0
        if has_functions:
            code_quality_score += 1.0
        if has_error_handling:
            code_quality_score += 1.0
        if has_parameters:
            code_quality_score += 0.5
            
        risk_score = 5.0 - (security_score - 5.0) * 0.5  # Inverse relationship
        
        # Generate command analysis
        commands_found = []
        powershell_commands = [
            ("Get-ChildItem", "Gets items in specified locations"),
            ("Write-Host", "Writes output to the host"),
            ("Write-Output", "Sends objects to the pipeline"),
            ("Write-Verbose", "Writes to verbose stream"),
            ("Write-Error", "Writes to error stream"),
            ("Test-Path", "Tests whether a path exists"),
            ("Get-Content", "Gets content from files"),
            ("Out-File", "Sends output to a file"),
            ("Where-Object", "Filters objects based on criteria"),
            ("ForEach-Object", "Performs operation on each object"),
            ("Import-Csv", "Imports CSV data"),
            ("Export-Csv", "Exports data to CSV")
        ]
        
        for cmd, desc in powershell_commands:
            if cmd in script_content:
                commands_found.append({
                    "name": cmd,
                    "description": desc,
                    "usage": f"Found in script: {script_name}",
                    "documentation_url": f"https://docs.microsoft.com/powershell/module/microsoft.powershell.management/{cmd.lower()}"
                })
        
        # Generate optimization suggestions
        optimizations = []
        if not has_error_handling:
            optimizations.append("Add try/catch blocks for better error handling")
        if not has_functions and len(script_content) > 200:
            optimizations.append("Consider breaking large scripts into functions")
        if "Write-Host" in script_content:
            optimizations.append("Consider using Write-Output for pipeline compatibility")
        if not has_parameters and len(script_content) > 100:
            optimizations.append("Add parameters to make script more reusable")
            
        # Specific analysis for script ID (if provided)
        if script_id == 10 or script_id == "10":
            logger.info("Providing detailed analysis for test script ID 10")
            return {
                "purpose": "Test PowerShell script that demonstrates basic functionality including file operations, error handling, and output formatting.",
                "security_score": 7.5,
                "code_quality_score": 8.0,
                "risk_score": 3.5,
                "category": "Testing & Development",
                "category_id": 5,
                "parameters": {
                    "InputPath": {
                        "type": "string",
                        "description": "Path to input directory or file",
                        "mandatory": True
                    },
                    "OutputPath": {
                        "type": "string", 
                        "description": "Path for output file",
                        "mandatory": False,
                        "defaultValue": "./output.txt"
                    },
                    "Verbose": {
                        "type": "switch",
                        "description": "Enable verbose output",
                        "mandatory": False
                    }
                },
                "optimization": [
                    "Add parameter validation for file paths",
                    "Consider adding more detailed error messages",
                    "Add help documentation for the script"
                ],
                "command_details": commands_found,
                "ms_docs_references": [
                    {
                        "command": "about_Functions",
                        "url": "https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_functions",
                        "description": "PowerShell functions documentation"
                    }
                ],
                "security_analysis": "Script follows good practices with error handling and path validation. Low security risk.",
                "security_issues": [],
                "best_practice_violations": [],
                "performance_insights": [
                    {
                        "description": "Script performance is good for small to medium files",
                        "suggestion": "For large files, consider streaming approaches"
                    }
                ]
            }
        
        # Generic analysis for other scripts
        purpose = "This PowerShell script appears to "
        if "Get-ChildItem" in script_content and "Remove-Item" in script_content:
            purpose += "manage files and directories, including cleanup operations."
        elif "Import-Csv" in script_content or "Export-Csv" in script_content:
            purpose += "process CSV data files."
        elif "Get-Service" in script_content or "Start-Service" in script_content:
            purpose += "manage Windows services."
        elif has_functions and has_parameters:
            purpose += "provide reusable functionality with configurable parameters."
        else:
            purpose += "perform system administration or automation tasks."
            
        return {
            "purpose": purpose,
            "security_score": round(security_score, 1),
            "code_quality_score": round(code_quality_score, 1), 
            "risk_score": round(risk_score, 1),
            "category": "System Administration",
            "category_id": 1,
            "parameters": {},
            "optimization": optimizations,
            "command_details": commands_found,
            "ms_docs_references": [
                {
                    "command": "PowerShell Documentation",
                    "url": "https://docs.microsoft.com/powershell/",
                    "description": "Official PowerShell documentation"
                }
            ],
            "security_analysis": f"Security analysis complete. Error handling: {'Yes' if has_error_handling else 'No'}. Input validation present: {'Yes' if 'Test-Path' in script_content else 'Limited'}.",
            "security_issues": [] if has_error_handling else [
                {
                    "severity": "medium",
                    "description": "Script lacks comprehensive error handling",
                    "remediation": "Add try/catch blocks around risky operations"
                }
            ],
            "best_practice_violations": [] if has_functions else [
                {
                    "severity": "low", 
                    "description": "Large script could benefit from function organization",
                    "remediation": "Break script into logical functions"
                }
            ],
            "performance_insights": []
        }
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2)
        self.wfile.write(response_json.encode('utf-8'))

def run_server(port=8000):
    """Run the AI service server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AIServiceHandler)
    
    logger.info(f"Starting Simple AI Service on port {port}")
    logger.info(f"Health check: http://localhost:{port}/")
    logger.info(f"Analysis endpoint: http://localhost:{port}/analyze")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down AI service")
        httpd.shutdown()

if __name__ == "__main__":
    run_server()