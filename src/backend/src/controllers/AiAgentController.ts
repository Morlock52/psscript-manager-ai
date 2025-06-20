/**
 * AI Agent Controller
 * Handles AI agent interactions including question answering and script analysis
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import aiService from '../utils/aiService';

class AiAgentController {
  /**
   * Answer a question using the AI agent
   */
  async answerQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, context, useAgent = false } = req.body;
      
      if (!question) {
        res.status(400).json({ 
          message: 'Question is required', 
          status: 'error' 
        });
        return;
      }
      
      logger.info(`Processing AI agent question: "${question.substring(0, 50)}..."`);
      
      // Call AI service to answer the question
      const result = await aiService.askQuestion(question, context, useAgent);
      
      // Log if fallback was used
      if (result.isFallback) {
        logger.warn('Using fallback response for question due to AI service unavailability');
      }
      
      res.json({ response: result.response });
    } catch (error) {
      logger.error('Error in AI agent question endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to process your question', 
        status: 'error' 
      });
    }
  }

  /**
   * Analyze a script using the AI assistant
   */
  async analyzeScript(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, filename, requestType = 'standard', analysisOptions } = req.body;
      
      if (!content) {
        res.status(400).json({ 
          message: 'Script content is required', 
          status: 'error' 
        });
        return;
      }
      
      logger.info(`Processing AI assistant analysis request: ${filename || 'unnamed script'}`);
      
      // Call AI service to analyze the script
      const analysisResult = await aiService.analyzeScript(content, filename, requestType, analysisOptions);
      
      // Log if fallback was used
      if (analysisResult.isFallback) {
        logger.warn('Using fallback analysis due to AI service unavailability');
      }
      
      res.json(analysisResult);
    } catch (error) {
      logger.error('Error in AI assistant analysis endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to analyze the script', 
        status: 'error' 
      });
    }
  }

  /**
   * Generate a script based on description
   */
  async generateScript(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      
      if (!description) {
        res.status(400).json({ 
          message: 'Description is required', 
          status: 'error' 
        });
        return;
      }
      
      logger.info(`Processing script generation request: "${description.substring(0, 50)}..."`);
      
      // Call AI service to generate the script
      const result = await aiService.generateScript(description);
      
      // Log if fallback was used
      if (result.isFallback) {
        logger.warn('Using fallback script generation due to AI service unavailability');
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error in script generation endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to generate script', 
        status: 'error' 
      });
    }
  }

  /**
   * Explain a script in detail
   */
  async explainScript(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, type = 'simple' } = req.body;
      
      if (!content) {
        res.status(400).json({ 
          message: 'Script content is required', 
          status: 'error' 
        });
        return;
      }
      
      logger.info(`Processing script explanation request (${type})`);
      
      // Call AI service to explain the script
      const result = await aiService.explainScript(content, type);
      
      // Log if fallback was used
      if (result.isFallback) {
        logger.warn('Using fallback script explanation due to AI service unavailability');
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error in script explanation endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to explain the script', 
        status: 'error' 
      });
    }
  }

  /**
   * Get similar script examples
   */
  async getSimilarExamples(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const description = req.query.description as string;
      const limit = parseInt(req.query.limit as string || '5', 10);
      
      if (!description) {
        res.status(400).json({ 
          message: 'Description is required', 
          status: 'error' 
        });
        return;
      }
      
      logger.info(`Processing script examples request: "${description.substring(0, 50)}..."`);
      
      // Call AI service to get similar examples
      const result = await aiService.getSimilarExamples(description, limit);
      
      // Log if fallback was used
      if (result.isFallback) {
        logger.warn('Using fallback script examples due to AI service unavailability');
      }
      
      res.json(result);
    } catch (error) {
      logger.error('Error in script examples endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve script examples', 
        status: 'error' 
      });
    }
  }
}

export default new AiAgentController();
