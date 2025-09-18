import fs from 'fs';
import path from 'path';

class EmailQueue {
  constructor() {
    this.queueFile = path.join(process.cwd(), 'email-queue.json');
    this.processing = false;
  }

  // Add email to queue
  async addToQueue(emailData) {
    try {
      const queue = await this.getQueue();
      const queueItem = {
        id: Date.now() + Math.random(),
        ...emailData,
        timestamp: new Date().toISOString(),
        attempts: 0,
        maxAttempts: 3
      };
      
      queue.push(queueItem);
      await this.saveQueue(queue);
      console.log(`📝 Email added to queue: ${emailData.to}`);
      
      // Try to process queue immediately
      this.processQueue();
      
      return queueItem.id;
    } catch (error) {
      console.error('❌ Error adding email to queue:', error.message);
    }
  }

  // Get current queue
  async getQueue() {
    try {
      if (fs.existsSync(this.queueFile)) {
        const data = fs.readFileSync(this.queueFile, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('❌ Error reading queue:', error.message);
      return [];
    }
  }

  // Save queue to file
  async saveQueue(queue) {
    try {
      fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
    } catch (error) {
      console.error('❌ Error saving queue:', error.message);
    }
  }

  // Process email queue
  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    console.log('🔄 Processing email queue...');
    
    try {
      const queue = await this.getQueue();
      const pendingEmails = queue.filter(item => item.attempts < item.maxAttempts);
      
      if (pendingEmails.length === 0) {
        console.log('✅ Email queue is empty');
        this.processing = false;
        return;
      }

      console.log(`📬 Found ${pendingEmails.length} emails in queue`);
      
      // Process emails one by one
      for (const emailItem of pendingEmails) {
        try {
          console.log(`📧 Processing queued email to: ${emailItem.to}`);
          
          // Import mailSender dynamically to avoid circular imports
          const { default: mailSender } = await import('./mailSender.js');
          
          const result = await mailSender(emailItem.to, emailItem.subject, emailItem.body);
          
          if (result.success) {
            console.log(`✅ Queued email sent successfully to: ${emailItem.to}`);
            // Remove from queue
            await this.removeFromQueue(emailItem.id);
          } else {
            console.log(`❌ Queued email failed for: ${emailItem.to}`);
            // Increment attempts
            await this.incrementAttempts(emailItem.id);
          }
          
          // Wait between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error processing queued email ${emailItem.id}:`, error.message);
          await this.incrementAttempts(emailItem.id);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing email queue:', error.message);
    } finally {
      this.processing = false;
    }
  }

  // Remove email from queue
  async removeFromQueue(emailId) {
    try {
      const queue = await this.getQueue();
      const filteredQueue = queue.filter(item => item.id !== emailId);
      await this.saveQueue(filteredQueue);
    } catch (error) {
      console.error('❌ Error removing email from queue:', error.message);
    }
  }

  // Increment attempts for an email
  async incrementAttempts(emailId) {
    try {
      const queue = await this.getQueue();
      const emailItem = queue.find(item => item.id === emailId);
      if (emailItem) {
        emailItem.attempts += 1;
        emailItem.lastAttempt = new Date().toISOString();
        await this.saveQueue(queue);
      }
    } catch (error) {
      console.error('❌ Error incrementing attempts:', error.message);
    }
  }

  // Start periodic queue processing (every 5 minutes)
  startPeriodicProcessing() {
    setInterval(() => {
      this.processQueue();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('🔄 Started periodic email queue processing (every 5 minutes)');
  }
}

// Create singleton instance
const emailQueue = new EmailQueue();

export default emailQueue;