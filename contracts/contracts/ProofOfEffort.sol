// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofOfEffort
 * @dev Main contract for recording and verifying proof-of-effort on blockchain
 */
contract ProofOfEffort is Ownable, ReentrancyGuard {
    
    struct EffortRecord {
        bytes32 recordId;
        address user;
        string ipfsHash;      // IPFS hash containing proof details
        uint256 timestamp;
        uint8 verificationLevel;
        uint256 pointsEarned;
        bool isVerified;
        uint256 verificationCount;
    }
    
    struct Verification {
        address verifier;
        bool approved;
        uint256 timestamp;
        string comments;
    }
    
    // Mapping from record ID to EffortRecord
    mapping(bytes32 => EffortRecord) public effortRecords;
    
    // Mapping from record ID to array of verifications
    mapping(bytes32 => Verification[]) public verifications;
    
    // Mapping from user address to their record IDs
    mapping(address => bytes32[]) public userRecords;
    
    // Mapping from user to total points
    mapping(address => uint256) public userPoints;
    
    // Mapping from address to verifier status
    mapping(address => bool) public isVerifier;
    
    // Mapping from verifier to reputation score
    mapping(address => uint256) public verifierReputation;
    
    // Events
    event EffortRecorded(bytes32 indexed recordId, address indexed user, string ipfsHash, uint256 timestamp);
    event EffortVerified(bytes32 indexed recordId, address indexed verifier, bool approved);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event PointsAwarded(address indexed user, uint256 points);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Record a new effort on the blockchain
     */
    function recordEffort(string memory ipfsHash) external returns (bytes32) {
        bytes32 recordId = keccak256(abi.encodePacked(msg.sender, ipfsHash, block.timestamp));
        
        require(effortRecords[recordId].timestamp == 0, "Record already exists");
        
        effortRecords[recordId] = EffortRecord({
            recordId: recordId,
            user: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            verificationLevel: 1, // Self-reported
            pointsEarned: 10,     // Base points
            isVerified: false,
            verificationCount: 0
        });
        
        userRecords[msg.sender].push(recordId);
        userPoints[msg.sender] += 10;
        
        emit EffortRecorded(recordId, msg.sender, ipfsHash, block.timestamp);
        emit PointsAwarded(msg.sender, 10);
        
        return recordId;
    }
    
    /**
     * @dev Submit verification for an effort record
     */
    function verifyEffort(bytes32 recordId, bool approved, string memory comments) external {
        require(isVerifier[msg.sender], "Not authorized verifier");
        require(effortRecords[recordId].timestamp != 0, "Record does not exist");
        require(effortRecords[recordId].user != msg.sender, "Cannot verify own effort");
        
        EffortRecord storage record = effortRecords[recordId];
        
        verifications[recordId].push(Verification({
            verifier: msg.sender,
            approved: approved,
            timestamp: block.timestamp,
            comments: comments
        }));
        
        if (approved) {
            record.verificationCount++;
            
            // Award points based on verification level
            uint256 bonusPoints = 0;
            if (record.verificationCount >= 5) {
                record.verificationLevel = 4; // Multi-sig consensus
                bonusPoints = 190; // 200 total - 10 already given
            } else if (record.verificationCount >= 2) {
                record.verificationLevel = 2; // Peer verified
                bonusPoints = 40;  // 50 total - 10 already given
            }
            
            if (bonusPoints > 0) {
                userPoints[record.user] += bonusPoints;
                record.pointsEarned += bonusPoints;
                emit PointsAwarded(record.user, bonusPoints);
            }
            
            if (record.verificationCount >= 2) {
                record.isVerified = true;
            }
            
            // Increase verifier reputation
            verifierReputation[msg.sender]++;
        }
        
        emit EffortVerified(recordId, msg.sender, approved);
    }
    
    /**
     * @dev Add a new verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Remove a verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        isVerifier[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Get user's total effort records count
     */
    function getUserRecordCount(address user) external view returns (uint256) {
        return userRecords[user].length;
    }
    
    /**
     * @dev Get user's record IDs
     */
    function getUserRecords(address user) external view returns (bytes32[] memory) {
        return userRecords[user];
    }
    
    /**
     * @dev Get verification count for a record
     */
    function getVerificationCount(bytes32 recordId) external view returns (uint256) {
        return verifications[recordId].length;
    }
    
    /**
     * @dev Get effort record details
     */
    function getEffortRecord(bytes32 recordId) external view returns (
        address user,
        string memory ipfsHash,
        uint256 timestamp,
        uint8 verificationLevel,
        uint256 pointsEarned,
        bool isVerified,
        uint256 verificationCount
    ) {
        EffortRecord memory record = effortRecords[recordId];
        return (
            record.user,
            record.ipfsHash,
            record.timestamp,
            record.verificationLevel,
            record.pointsEarned,
            record.isVerified,
            record.verificationCount
        );
    }
}
