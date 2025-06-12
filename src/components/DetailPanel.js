import React from "react";
import { FaDatabase, FaCloud, FaCogs, FaServer } from "react-icons/fa";
import analyticsImage from "../images/analytics-image.png";
import spaInwardImage from "../images/spa-inward.png";
import spaOutwardImage from "../images/spa-outward.png";
import videoRequestImage from "../images/videorequest.png";
import videoUploadImage from "../images/videoupload.png";
import "../styles/DetailPanel.css";

const DetailPanel = ({ node, onClose }) => {
  if (!node) return null;

  const { name, node: nodeType, details = {} } = node;

  const renderBlock = (title, items, IconComponent) => {
    if (!items || items.length === 0) return null;

    return (
      <div
        className="detail-block"
        tabIndex={0}
        role="region"
        aria-label={title}
      >
        <div className="detail-block-header">
          <IconComponent className="detail-icon" />
          <h4>{title}</h4>
        </div>
        <ul className="detail-list">
          {items.map((item, index) => (
            <li key={index} className="detail-item">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const isAnalytics = nodeType === "Analytics";
  const isVideoRequest = nodeType === "Backend Service III";

  return (
    <div
      className="detail-panel-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`detail-panel ${
          isAnalytics || isVideoRequest ? "large-panel" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-labelledby="detail-panel-title"
        style={{ position: "relative" }}
      >
        <div className="detail-panel-header">
          <h3 id="detail-panel-title">{name}</h3>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Close details panel"
          >
            ✕
          </button>
        </div>
        <div className="detail-panel-body">
          {isAnalytics ? (
            <>
              <div className="analytics-image-container">
                <img
                  src={analyticsImage}
                  alt="Analytics Details"
                  className="analytics-image"
                />
              </div>
              <div
                className="analytics-image-container"
                style={{ marginTop: "1rem" }}
              >
                <img
                  src={spaInwardImage}
                  alt="SPA Inward"
                  className="analytics-image"
                />
              </div>
              <div
                className="analytics-image-container"
                style={{ marginTop: "1rem" }}
              >
                <img
                  src={spaOutwardImage}
                  alt="SPA Outward"
                  className="analytics-image"
                />
              </div>
            </>
          ) : isVideoRequest ? (
            <>
              <div className="video-request-image-container">
                <img
                  src={videoRequestImage}
                  alt="Video Request Details"
                  className="video-request-image"
                />
              </div>
              <div
                className="video-request-image-container"
                style={{ marginTop: "1rem" }}
              >
                <img
                  src={videoUploadImage}
                  alt="Video Upload Details"
                  className="video-request-image"
                />
              </div>
            </>
          ) : (
            <>
              {renderBlock("Databases", details.databases, FaDatabase)}
              {renderBlock("S3 Buckets", details.s3Buckets, FaCloud)}
              {renderBlock("Redis", details.redis, FaServer)}
              {renderBlock("Third-Party Services", details.thirdParty, FaCogs)}
              {Object.keys(details).length === 0 && (
                <p className="no-details">No extra metadata found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
