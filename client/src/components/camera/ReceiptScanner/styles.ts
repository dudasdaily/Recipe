import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: black;
`;

export const CameraContainer = styled.View`
  flex: 1;
`;

export const GuideContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`;

export const GuideBox = styled.View`
  width: 80%;
  height: 60%;
  border-width: 2px;
  border-color: white;
  border-style: dashed;
  opacity: 0.5;
`;

export const GuideText = styled.Text`
  color: white;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

export const ControlsContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

export const CaptureButton = styled.TouchableOpacity`
  width: 70px;
  height: 70px;
  border-radius: 35px;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

export const CancelButton = styled.TouchableOpacity`
  padding: 10px;
`;

export const CancelText = styled.Text`
  color: white;
  font-size: 16px;
`; 