import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-mature-warning',
    template: `
      <div class="warning-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Oops! Spicy Content Ahead</h4>
            <button type="button" class="custom-close-btn" (click)="activeModal.dismiss()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="warning-animation">
              <svg viewBox="0 0 200 200" class="warning-svg">
                <!-- Exclamation Circle -->
                <circle cx="100" cy="100" r="80" class="circle-pulse"></circle>
                
                <!-- Eye -->
                <g class="eye-group">
                  <ellipse cx="100" cy="95" rx="40" ry="30" class="eye"></ellipse>
                  <ellipse cx="100" cy="95" rx="20" ry="20" class="pupil"></ellipse>
                  <path d="M60,95 C60,65 140,65 140,95 C140,125 60,125 60,95 Z" class="eyelid"></path>
                </g>
                
                <!-- Exclamation Point -->
                <g class="exclamation">
                  <rect x="95" y="50" width="10" height="50" rx="5" class="exclamation-line"></rect>
                  <circle cx="100" cy="115" r="6" class="exclamation-dot"></circle>
                </g>
                
                <!-- Alert Icon -->
                <path d="M95,130 L65,170 L135,170 Z" class="alert-triangle"></path>
                <text x="100" y="160" text-anchor="middle" class="alert-text">18+</text>
              </svg>
            </div>
            
            <div class="warning-message">
              <p class="sassy-warning">Well hello there, adventurous one! 👀</p>
              <p>You're about to unlock the <span class="spicy">spicier side</span> of our movie collection.</p>
              <p>Just making sure you're old enough to handle what's behind this digital curtain.</p>
              <p class="disclaimer">By enabling mature content, you confirm you're of legal age to view adult-themed movies in your region.</p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss()">
              Nevermind, Keep It PG
            </button>
            <button type="button" class="btn btn-warning confirm-btn" (click)="activeModal.close('confirmed')">
              <span class="btn-text">Show Me Everything</span>
            </button>
          </div>
        </div>
      </div>
    `,
    styles: [`
      :host {
        --primary-color: #682f76;
        --secondary-color: #f6f6f4;
        --accent-color: #b0e66b;
        --warning-color: #e20f0f;
        --dark-color: #07295f;
      }
      
      .warning-modal {
        color: var(--secondary-color);
      }
      
      .modal-content {
        background-color: var(--primary-color);
        border: 2px solid var(--warning-color);
      }
      
      .modal-header {
        border-bottom: none;
        padding: 1.5rem 1.5rem 0.5rem;
        position: relative;
      }
      
      .modal-header h4 {
        color: var(--warning-color);
        font-weight: bold;
        font-size: 1.5rem;
        margin: 0 auto;
        text-align: center;
        width: 100%;
      }
      
      .custom-close-btn {
        position: absolute;
        right: 15px;
        top: 15px;
        background: transparent;
        border: none;
        color: var(--secondary-color);
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      
      .custom-close-btn:hover {
        background-color: rgba(246, 246, 244, 0.1);
        transform: scale(1.1);
      }
      
      .custom-close-btn:focus {
        outline: none;
      }
      
      .modal-body {
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .warning-animation {
        width: 150px;
        height: 150px;
        margin-bottom: 1rem;
      }
      
      .warning-svg {
        width: 100%;
        height: 100%;
      }
      
      /* SVG Animation Styles */
      .circle-pulse {
        fill: rgba(226, 15, 15, 0.1);
        stroke: var(--warning-color);
        stroke-width: 3;
        transform-origin: center;
        animation: pulse 2s infinite;
      }
      
      .eye {
        fill: var(--secondary-color);
        stroke: var(--dark-color);
        stroke-width: 2;
      }
      
      .pupil {
        fill: var(--dark-color);
        animation: look 4s infinite;
      }
      
      .eyelid {
        fill: transparent;
        stroke: var(--dark-color);
        stroke-width: 2;
        animation: blink 3s infinite;
      }
      
      .exclamation {
        transform-origin: center;
        animation: shake 0.5s ease-in-out 5;
        animation-delay: 2s;
      }
      
      .exclamation-line, .exclamation-dot {
        fill: var(--warning-color);
      }
      
      .alert-triangle {
        fill: var(--warning-color);
        opacity: 0;
        animation: fadeIn 0.5s ease-in-out forwards;
        animation-delay: 3.5s;
      }
      
      .alert-text {
        fill: var(--secondary-color);
        font-weight: bold;
        font-size: 18px;
        opacity: 0;
        animation: fadeIn 0.5s ease-in-out forwards;
        animation-delay: 3.5s;
      }
      
      /* Warning Message Styles */
      .warning-message {
        text-align: center;
        margin-top: 1rem;
        width: 100%;
      }
      
      .sassy-warning {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--accent-color);
        margin-bottom: 0.5rem;
      }
      
      .spicy {
        color: var(--warning-color);
        font-weight: bold;
        font-style: italic;
      }
      
      .disclaimer {
        font-size: 0.85rem;
        font-style: italic;
        opacity: 0.8;
        margin-top: 1rem;
        border-top: 1px dashed rgba(246, 246, 244, 0.2);
        padding-top: 1rem;
      }
      
      /* Footer Styles */
      .modal-footer {
        border-top: none;
        padding: 0.5rem 1.5rem 1.5rem;
        justify-content: center;
        gap: 1rem;
      }
      
      .btn-outline-secondary {
        color: var(--secondary-color);
        border-color: rgba(246, 246, 244, 0.3);
        transition: all 0.2s;
      }
      
      .btn-outline-secondary:hover {
        background-color: rgba(246, 246, 244, 0.1);
        color: var(--secondary-color);
      }
      
      .btn-warning {
        background-color: var(--warning-color);
        border: none;
        color: var(--secondary-color);
      }
      
      .confirm-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s;
      }
      
      .confirm-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(226, 15, 15, 0.3);
      }
      
      .confirm-btn:after {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg, 
          transparent, 
          rgba(246, 246, 244, 0.2), 
          transparent
        );
        transition: 0.5s;
      }
      
      .confirm-btn:hover:after {
        left: 100%;
      }
      
      .btn-text {
        position: relative;
        z-index: 1;
      }
      
      /* Animations */
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 0.9; }
        100% { transform: scale(1); opacity: 0.8; }
      }
      
      @keyframes blink {
        0%, 90%, 100% { transform: translateY(-30px); }
        95% { transform: translateY(0); }
      }
      
      @keyframes look {
        0%, 40% { transform: translateX(0); }
        45% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        55% { transform: translateX(0); }
        100% { transform: translateX(0); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        50% { transform: translateX(0); }
        75% { transform: translateX(2px); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Mobile Responsive Styles */
      @media (max-width: 576px) {
        .modal-header h4 {
          font-size: 1.3rem;
        }
        
        .warning-animation {
          width: 120px;
          height: 120px;
        }
        
        .sassy-warning {
          font-size: 1rem;
        }
        
        .modal-footer {
          flex-direction: column-reverse;
          align-items: stretch;
        }
      }
    `]
  })
  export class MatureWarningComponent {
    constructor(public activeModal: NgbActiveModal) {}
  }