import React from "react";
import "./EventDetailModal.scss";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    staffName: string;
    shiftName: string;
    date: string;
    startTime: string;
    endTime: string;
    assignmentId: string;
  } | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  eventDetails,
}) => {
  if (!isOpen || !eventDetails) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Details</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <strong>Staff:</strong>
            <span>{eventDetails.staffName}</span>
          </div>
          <div className="detail-row">
            <strong>Shift:</strong>
            <span>{eventDetails.shiftName}</span>
          </div>
          <div className="detail-row">
            <strong>Date:</strong>
            <span>{eventDetails.date}</span>
          </div>
          <div className="detail-row">
            <strong>Start Time:</strong>
            <span>{eventDetails.startTime}</span>
          </div>
          <div className="detail-row">
            <strong>End Time:</strong>
            <span>{eventDetails.endTime}</span>
          </div>
          <div className="detail-row">
            <strong>Assignment ID:</strong>
            <span>{eventDetails.assignmentId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
