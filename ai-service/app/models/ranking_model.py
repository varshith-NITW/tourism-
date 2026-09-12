import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict, Any

class CheckinRankingNet(nn.Module):
    """
    PyTorch Neural Tensor Scoring Model for Check-In Driven Stay Recommendation.
    Completely omits star ratings and scores properties based on:
    1. Total Google Maps Check-In Footfall (Log scale)
    2. Weekly Visitor Check-In Velocity
    3. Inverse Proximity Distance (km)
    4. Local Area Footfall Rank (Top 1, Top 2, etc.)
    """
    def __init__(self, input_dim: int = 4, hidden_dim: int = 16):
        super(CheckinRankingNet, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid()  # Outputs normalized ranking affinity [0.0, 1.0]
        )
        
        # Initialize with domain-informed inductive bias weights:
        # Check-ins and velocity have high positive weights, distance has negative penalty
        with torch.no_grad():
            self.network[0].weight.data = torch.tensor([
                [0.85, 0.65, 0.50, 0.40],
                [0.70, 0.80, 0.45, 0.35],
                [0.90, 0.75, 0.60, 0.50],
                [0.60, 0.55, 0.70, 0.30],
                [0.80, 0.70, 0.40, 0.60],
                [0.75, 0.65, 0.55, 0.45],
                [0.65, 0.85, 0.50, 0.40],
                [0.70, 0.60, 0.65, 0.50],
                [0.80, 0.75, 0.45, 0.55],
                [0.85, 0.70, 0.50, 0.40],
                [0.90, 0.80, 0.60, 0.35],
                [0.75, 0.65, 0.55, 0.50],
                [0.70, 0.75, 0.40, 0.60],
                [0.85, 0.60, 0.65, 0.45],
                [0.80, 0.85, 0.50, 0.40],
                [0.75, 0.70, 0.60, 0.50]
            ], dtype=torch.float32)
            self.network[0].bias.data.fill_(0.05)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Input x: Shape (batch_size, 4)
        Returns: Shape (batch_size, 1) normalized check-in score
        """
        return self.network(x)


# Global singleton inference instance
_model_instance = None

def get_ranking_model() -> CheckinRankingNet:
    global _model_instance
    if _model_instance is None:
        _model_instance = CheckinRankingNet()
        _model_instance.eval()
    return _model_instance

def compute_pytorch_ranking_scores(hotels: List[Dict[str, Any]], distance_kms: List[float]) -> List[float]:
    """
    Constructs PyTorch tensor from hotel check-in metrics and evaluates batch scores.
    """
    model = get_ranking_model()
    
    features = []
    for hotel, dist in zip(hotels, distance_kms):
        checkins = float(hotel.get("checkin_count", 1000))
        weekly = float(hotel.get("weekly_checkins", 100))
        footfall_rank = float(hotel.get("footfall_rank", 1))
        
        # Normalized input tensor features
        norm_log_checkins = min(1.0, np.log10(max(10.0, checkins)) / 5.0)  # Log-scale check-ins
        norm_weekly_vel = min(1.0, weekly / 600.0)
        norm_inv_dist = max(0.0, (5.0 - min(5.0, dist)) / 5.0)  # Closer is higher
        norm_rank = max(0.1, (10.0 - min(10.0, footfall_rank)) / 10.0)
        
        features.append([norm_log_checkins, norm_weekly_vel, norm_inv_dist, norm_rank])
    
    # Create input Tensor
    input_tensor = torch.tensor(features, dtype=torch.float32)
    
    with torch.no_grad():
        output_tensor = model(input_tensor)
        scores = output_tensor.squeeze(-1).tolist()
    
    if isinstance(scores, float):
        return [scores]
    return scores
