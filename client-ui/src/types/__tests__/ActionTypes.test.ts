import {
  ActionType,
  isSlideAction,
  isTallyAction,
  isTrackAction,
  isStreamAction,
  isIdentifyAction,
  isUrlAction,
} from '../ActionTypes';
import {
  Action,
  SlideAction,
  TallyAction,
  TrackAction,
  StreamAction,
  IdentifyAction,
  UrlAction,
} from '../LiveSlides';

describe('Action type guards', () => {
  describe('isSlideAction', () => {
    it('should return true for SlideAction', () => {
      const action = new SlideAction();
      action.slideId = 'test-slide';
      expect(isSlideAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new TallyAction();
      expect(isSlideAction(action)).toBe(false);
    });
  });

  describe('isTallyAction', () => {
    it('should return true for TallyAction', () => {
      const action = new TallyAction();
      action.answer = 'A';
      expect(isTallyAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new SlideAction();
      expect(isTallyAction(action)).toBe(false);
    });
  });

  describe('isTrackAction', () => {
    it('should return true for TrackAction', () => {
      const action = new TrackAction();
      action.event = 'button_clicked';
      expect(isTrackAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new StreamAction();
      expect(isTrackAction(action)).toBe(false);
    });
  });

  describe('isStreamAction', () => {
    it('should return true for StreamAction', () => {
      const action = new StreamAction();
      action.message = 'Hello';
      expect(isStreamAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new TrackAction();
      expect(isStreamAction(action)).toBe(false);
    });
  });

  describe('isIdentifyAction', () => {
    it('should return true for IdentifyAction', () => {
      const action = new IdentifyAction();
      action.properties = { email: 'test@example.com' };
      expect(isIdentifyAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new UrlAction();
      expect(isIdentifyAction(action)).toBe(false);
    });
  });

  describe('isUrlAction', () => {
    it('should return true for UrlAction', () => {
      const action = new UrlAction();
      action.url = 'https://example.com';
      expect(isUrlAction(action)).toBe(true);
    });

    it('should return false for other action types', () => {
      const action = new IdentifyAction();
      expect(isUrlAction(action)).toBe(false);
    });
  });

  describe('type narrowing', () => {
    it('should allow type-safe access after type guard', () => {
      const action: Action = new SlideAction();
      (action as SlideAction).slideId = 'slide-123';

      if (isSlideAction(action)) {
        // TypeScript should allow accessing slideId without casting
        expect(action.slideId).toBe('slide-123');
      } else {
        fail('Type guard should have returned true');
      }
    });

    it('should prevent access to wrong properties', () => {
      const action: Action = new TallyAction();
      (action as TallyAction).answer = 'B';

      if (isTallyAction(action)) {
        expect(action.answer).toBe('B');
        // This should be type-safe - no slideId on TallyAction
      }
    });
  });
});
